/* eslint-disable indent */
// eslint-disable-next-line import/extensions
import { getDistance, intersects, getOrbitAngle, findLinesIntersection, getArrayMin, splitPointsIntoLines, findCircleLinePointsIntersections, rotatePoint, getAngle, convertTimeDiff, getPositionAlongTheLine, isLeft } from './mathHelpers.js';

const SHOW_ORBITS = true;
const canvasWidth = 1920;
const canvasHeight = 933;

let chronoStart = null;
let chronoCurrent = null;
let chronoEnd = null;
let isChronoEnded = false;
let timeToFinishLevel = 0;
let apiSendInAction = false;

const { level } = window;
const { planets } = level;
const { asteroidLines } = level;
const levelMusicPath = level.music;
let levelBackground = 220;

const orbitSpeed = 0.3;
const spaceSpeed = 8;
const ship = {
    x: 400,
    y: 400,
    speed: orbitSpeed,
    acceleration: 0,
    orientation: 0,
    planetAngle: -0.2,
    planetIndex: 0,
    clockwise: true,
    nextPlanetIndex: -1,
    anchorPoint: { planetAngle: 0, clockwise: true, point: null },
    color: 'white',
    nextStepRemainingTick: 0,
    nextStepPlanetIndex: -2, // -2 means Void, -1 means Die, >-1 means planetIndex
};
let lastShipPlanetIndex = 4;

let shipEngineSound;
let boostSound;
let explodeSound2;
let levelMusic;
let images;
let linesDebug = [];
let targetPoint = null;

function preload() {
    shipEngineSound = loadSound('./Assets/Sound/MoteurVaisseau.mp3');
    levelMusic = loadSound(levelMusicPath);
    boostSound = loadSound('./Assets/Sound/boost3.wav');
    explodeSound2 = loadSound('./Assets/Sound/explode2.mp3');
    images = {
        crateres: loadImage('./Assets/Sprites/Crateres/c0.png'),
        earth: loadImage('./Assets/Sprites/Earth/PE001.png'),
        saumon: loadImage('./Assets/Sprites/Saumon/S01.png'),
        planets: [
            loadImage('./Assets/Sprites/Beige.png'),
            loadImage('./Assets/Sprites/Bleue.png'),
            loadImage('./Assets/Sprites/Jaune.png'),
            loadImage('./Assets/Sprites/Noire.png'),
            loadImage('./Assets/Sprites/Orange.png'),
            loadImage('./Assets/Sprites/Rouge.png'),
            loadImage('./Assets/Sprites/Verte.png'),
            loadImage('./Assets/Sprites/Bleue2.png'),
            loadImage('./Assets/Sprites/Bleue3.png'),
            loadImage('./Assets/Sprites/Rose.png'),
            loadImage('./Assets/Sprites/Orange2.png'),
            loadImage('./Assets/Sprites/Verte2.png'),
        ],
        rocks: [
            loadImage('./Assets/Sprites/Rock1.png'),
            loadImage('./Assets/Sprites/Rock2.png'),
            loadImage('./Assets/Sprites/Rock3.png'),
            loadImage('./Assets/Sprites/Rock4.png'),
        ],
        ship: loadImage('./Assets/Sprites/Ship.png'),
        end: loadImage('./Assets/Sprites/End.png'),
    };
}

// -------------------------------------------------------------------
// ------------------------------------------------ Musics
// -------------------------------------------------------------------

function playShipEngineSound() {
    getAudioContext().resume();
    shipEngineSound.setVolume(0.08);
    shipEngineSound.loop();
}

function playLevelMusic() {
    getAudioContext().resume();
    levelMusic.setVolume(0.5);
    levelMusic.loop();
}

function playExplosion() {
    getAudioContext().resume();
    explodeSound2.setVolume(0.3);
    explodeSound2.play();
}

function playBoost() {
    getAudioContext().resume();
    boostSound.setVolume(0.1);
    boostSound.play();
}

function gameover() {
    ship.planetIndex = lastShipPlanetIndex;
    ship.speed = orbitSpeed;
    playExplosion();
}

function displayLevelEndModal() {
    const levelEndModalElement = document.getElementById('levelEndModal');
    if (levelEndModalElement) {
        levelEndModalElement.classList.remove('invisible');
    }

    const chronoEndElement = document.getElementById('chronoEnd');
    if (chronoEndElement) {
        chronoEndElement.innerHTML = '' + timeToFinishLevel + ' seconds';
    }
}

function levelEnd() {
    isChronoEnded = true;
    chronoEnd = Date.now();
    const diff = chronoEnd - chronoStart;
    timeToFinishLevel = convertTimeDiff(diff);
    displayLevelEndModal();
}

// -------------------------------------------------------------------
// ------------------------------------------------ Move Ships
// -------------------------------------------------------------------

function attachShipToNextPlanet(planetIndex) {
    ship.planetIndex = planetIndex;
    lastShipPlanetIndex = ship.planetIndex;
    ship.planetAngle = ship.anchorPoint.planetAngle;
    ship.clockwise = ship.anchorPoint.clockwise;
    ship.anchorPoint.point = null;
    const planet = planets[ship.planetIndex];
    if (planet.isEnd) levelEnd();
}

function moveShipInSpace() {
    const o = ship.orientation;
    const dr = ship.speed;
    const dx = dr * cos(o);
    const dy = dr * sin(o);
    ship.x += dx;
    ship.y += dy;

    if (ship.nextStepPlanetIndex > -2) {
        ship.nextStepRemainingTick -= 1;

        if (ship.nextStepRemainingTick < 1) {
            if (ship.nextStepPlanetIndex === -1) gameover();
            else attachShipToNextPlanet(ship.nextStepPlanetIndex);

            ship.nextStepPlanetIndex = -2;
            ship.nextStepRemainingTick = 0;
        }
    }
    if (ship.x < 0 || ship.x > canvasWidth) gameover();
    if (ship.y < 0 || ship.y > canvasWidth) gameover();
}

function moveShipInOrbit() {
    const planet = planets[ship.planetIndex];
    const { x, y, size, orbitDistance } = planet;
    const o = ship.planetAngle;
    const dr = (size + orbitDistance) / 2;
    const dx = dr * cos(o);
    const dy = dr * sin(o);
    if (ship.speed > orbitSpeed) {
        ship.speed += ship.acceleration;
        ship.acceleration += 0.0005;
    }
    if (ship.speed < orbitSpeed) ship.speed = orbitSpeed;
    ship.x = x + dx;
    ship.y = y + dy;
    const angularVelocity = (2 * ship.speed) / (Math.PI * dr);
    ship.planetAngle += ship.clockwise ? angularVelocity : -angularVelocity;
    ship.orientation = ship.planetAngle + (ship.clockwise ? (Math.PI / 2) : -(Math.PI / 2));
}

function moveShip() {
    if (ship.planetIndex < 0) {
        moveShipInSpace();
    } else {
        moveShipInOrbit();
    }
}

// -------------------------------------------------------------------
// ------------------------------------------------ Calculate Trajectory Obstacle
// -------------------------------------------------------------------

function handleAsteroidLinesTrajectory(dx, dy) {
    const deadAsteroidPoints = [];

    asteroidLines.forEach((asteroidLine) => {
        splitPointsIntoLines(asteroidLine.points).forEach((line) => {
            const isIntesecting = intersects(line.a.x, line.a.y, line.b.x, line.b.y, ship.x, ship.y, dx, dy);
            if (isIntesecting) {
                const intersection = findLinesIntersection({ x: ship.x, y: ship.y }, { x: dx, y: dy }, line.a, line.b);
                deadAsteroidPoints.push(intersection);
            }
        });
    });

    if (deadAsteroidPoints.length < 1) return;

    const deadPoint = getArrayMin(deadAsteroidPoints, (point) => getDistance(ship.x, ship.y, point.x, point.y));
    if (deadPoint !== null) {
        const distance = getDistance(ship.x, ship.y, deadPoint.x, deadPoint.y);
        const tickUntilDead = parseInt(distance / spaceSpeed, 10);
        if (ship.nextStepRemainingTick > tickUntilDead) {
            ship.nextStepRemainingTick = tickUntilDead;
            ship.nextStepPlanetIndex = -1; // means dead
        }
    }
}

function validTrajectory(planet, planetIndex, intersectionWithOrbit) {
    ship.nextStepPlanetIndex = planetIndex;

    const shipPoint = { x: ship.x, y: ship.y };
    const planetPoint = { x: planet.x, y: planet.y };
    const anchorPoint = getArrayMin(intersectionWithOrbit, (point) => getDistance(ship.x, ship.y, point.x, point.y));

    const distance = getDistance(ship.x, ship.y, anchorPoint.x, anchorPoint.y);
    ship.nextStepRemainingTick = parseInt(distance / spaceSpeed, 10);
    const clockwise = !isLeft(shipPoint, planetPoint, anchorPoint);
    ship.anchorPoint = {
        planetAngle: getOrbitAngle(planet, anchorPoint),
        clockwise,
        point: anchorPoint,
    };
}

function handlePlanetsTrajectory(dx, dy) {
    const shipLine = { a: { x: ship.x, y: ship.y }, b: { x: dx, y: dy } };

    planets.forEach((planet, planetIndex) => {
        if (planetIndex === ship.planetIndex) {
            return; // No need to check collision beetween the planet where the ship is
        }

        const distance = getDistance(ship.x, ship.y, planet.x, planet.y);
        const tickUntilDistance = distance / spaceSpeed;
        if (ship.nextStepPlanetIndex > -2 && tickUntilDistance > ship.nextStepRemainingTick) {
            return; // No need to check collision beetween this planet because the ship will colide with an another planet before this one
        }

        const intersectionWithPlanet = findCircleLinePointsIntersections(planet.size / 2, planet.x, planet.y, shipLine.a, shipLine.b);
        const intersectionWithOrbit = findCircleLinePointsIntersections((planet.size + planet.orbitDistance) / 2, planet.x, planet.y, shipLine.a, shipLine.b);

        if (intersectionWithPlanet.length > 0) {
            const nearestPointDead = getArrayMin(intersectionWithOrbit, (point) => getDistance(ship.x, ship.y, point.x, point.y));
            const distanceDead = getDistance(ship.x, ship.y, nearestPointDead.x, nearestPointDead.y);
            ship.nextStepRemainingTick = parseInt(distanceDead / spaceSpeed, 10);
            ship.nextStepPlanetIndex = -1;
        } else if (intersectionWithPlanet.length === 0 && intersectionWithOrbit.length >= 1) {
            validTrajectory(planet, planetIndex, intersectionWithOrbit);
        }
    });
}

function calculateShipTrajectory() {
    ship.nextStepRemainingTick = 0;
    ship.nextStepPlanetIndex = -2;
    const dx = ship.x + (1000 * cos(ship.orientation));
    const dy = ship.y + (1000 * sin(ship.orientation));

    ship.speed = spaceSpeed;
    ship.acceleration = -0.1;
    ship.nextStepRemainingTick = Infinity;

    handleAsteroidLinesTrajectory(dx, dy);
    handlePlanetsTrajectory(dx, dy);
}

// -------------------------------------------------------------------
// ------------------------------------------------ DrawObjects
// -------------------------------------------------------------------

function setBackground() {
    levelBackground = loadImage(level.background);
}

function drawAsteroidLine(pointA, pointB, points) {
    points.forEach((point) => {
        image(images.rocks[point.type], (point.pos.x - 9), (point.pos.y - 9), 18, 18);
    });
}

function drawAsteroidLines() {
    asteroidLines.forEach((asteroidLine) => {
        splitPointsIntoLines(asteroidLine.points).forEach((line) => {
            drawAsteroidLine(line.a, line.b, asteroidLine.subpoints);
        });
    });
}

function drawPlanet(_x, _y, _size, _color, i, _orbit, _isStart, _isEnd) {
    if (i !== null) {
        image(images.planets[i], _x - (_size / 2), _y - (_size / 2), _size, _size);
    } else {
        fill(color(_color));
        noStroke();
        ellipse(_x, _y, _size, _size);
    }

    if (SHOW_ORBITS) {
        noFill();
        if (_isStart) {
            stroke(color('#34fa59'));
            strokeWeight(0.5);
        } else if (_isEnd) {
            stroke(color('#ff5c5c'));
            strokeWeight(0.5);
        } else {
            stroke(color('#ffffff'));
            strokeWeight(0.1);
        }
        ellipse(_x, _y, _size + _orbit, _size + _orbit);
        if (_isEnd) image(images.end, _x - 25, _y - 100, 60, 85);
    }
}

function drawPlanets() {
    planets.forEach(({ x, y, size, color, image, orbitDistance, isStart, isEnd }) => {
        drawPlanet(x, y, size, color, image, orbitDistance, isStart, isEnd);
    });
}

function drawShip() {
    resetMatrix();
    translate(ship.x, ship.y);
    rotate(ship.orientation);

    fill(color('#fd8700'));
    noStroke();
    // triangle(10, 0, -5, -5, -5, 5);
    let xRandom = ((Math.random() * 6) - 3);
    const yRandom = ((Math.random() * 2) - 1);
    if (ship.planetIndex === -1) xRandom -= 50;
    triangle(-20 + xRandom, yRandom, -13, -3, -13, 3);
    image(images.ship, -13.7, -10, 27, 20);
}

function drawRays() {
    ship.color = 'white';
    if (ship.planetIndex < 0) return;

    resetMatrix();
    stroke(color(ship.color));
    translate(ship.x, ship.y);
    rotate(ship.orientation);
    line(0, 0, 2000, 0);
}

function createAsteriodPoints() {
    asteroidLines.forEach((asteroidLine, t) => {
        const distance = getDistance(asteroidLine.points[0].x, asteroidLine.points[0].y, asteroidLine.points[1].x, asteroidLine.points[1].y);
        const v = 22;
        const space = Math.floor(distance / v);
        const delta = (distance / v) - space;
        asteroidLines[t].subpoints = [];
        for (let i = 0; i <= space; i += 1) {
            const pos = getPositionAlongTheLine(asteroidLine.points[0].x, asteroidLine.points[0].y, asteroidLine.points[1].x, asteroidLine.points[1].y, ((i * v) / distance) + (delta / v));
            pos.x += (Math.random() * 10) - 5;
            pos.y += (Math.random() * 10) - 5;
            asteroidLine.subpoints.push({ pos, type: Math.floor(Math.random() * 4) });
        }
    });
}

// -------------------------------------------------------------------
// ------------------------------------------------ Canvas p5 functions
// -------------------------------------------------------------------

function compute() {
    moveShip();
}

function initChronoMeter() {
    chronoStart = Date.now();
    chronoCurrent = Date.now();
    chronoEnd = Date.now();
    isChronoEnded = false;
}

function displayChrono() {
    if (!isChronoEnded) {
        chronoCurrent = Date.now();
        const diff = chronoCurrent - chronoStart;
        const seconds = convertTimeDiff(diff);
        document.getElementById('chrono').innerHTML = `${seconds}`;
    }
}

function setup() {
    setBackground();
    createCanvas(canvasWidth, canvasHeight);
    setInterval(compute, 10);
    playShipEngineSound();
    playLevelMusic();
    initChronoMeter();
    createAsteriodPoints();
}

function draw() {
    background(levelBackground);
    drawAsteroidLines();
    drawPlanets();
    drawRays();
    drawShip();
    displayChrono();

    if (linesDebug.length < 1) return;
    resetMatrix();
    stroke(color('red'));
    linesDebug.forEach((lineObject) => {
        line(lineObject.a.x, lineObject.a.y, lineObject.b.x, lineObject.b.y);
    });
    stroke(color('blue'));
    ellipse(targetPoint.x, targetPoint.y, 20, 20);
}

function keyPressed() {
    if (!isChronoEnded) {
        calculateShipTrajectory();
        playBoost();
        ship.planetIndex = -1;
    }
}

// -------------------------------------------------------------------
// ------------------------------------------------ Menu Navigation
// -------------------------------------------------------------------

function goToCredits() {
    document.location.href = '/thecrew.html';
}

function checkPlayerName() {
    const playerNameInput = document.getElementById('playerNameInput');
    if (playerNameInput) {
        if (playerNameInput.value) {
            return true;
        }
    }
    return false;
}

function postHighScoresViaAPI(_level, playerName, time) {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();

        request.open('POST', 'https://scoreback.herokuapp.com', true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.onload = () => {
            if (request.status >= 200 && request.status < 300) {
                resolve(request.response);
            } else {
                reject('Error');
            }
        };
        request.send('level=' + _level + '&playerName=' + playerName + '&time=' + time);
    });
}

function tryToQuit() {
    if (!apiSendInAction) {
        const playerNameIsValid = checkPlayerName();
        if (playerNameIsValid) {
            document.getElementById('error-message').classList.add('invisible');
            const playerNameInput = document.getElementById('playerNameInput');
            apiSendInAction = true;
            postHighScoresViaAPI(level.levelNumber, playerNameInput.value, timeToFinishLevel).then(data => {
                apiSendInAction = false;
                window.location.href = '/';
            });
        } else {
            document.getElementById('error-message').classList.remove('invisible');
        }
    }
}

function goToNextLevel(levelToLoad) {
    switch (levelToLoad) {
        case 1:
            document.location.href = '/game-level1.html';
            break;
        case 2:
            document.location.href = '/game-level2.html';
            break;
        default:
            goToCredits();
            break;
    }
}

function tryToGoToNextLevel() {
    if (!apiSendInAction) {
        const playerNameIsValid = checkPlayerName();
        if (playerNameIsValid) {
            document.getElementById('error-message').classList.add('invisible');
            const playerNameInput = document.getElementById('playerNameInput');
            apiSendInAction = true;
            postHighScoresViaAPI(level.levelNumber, playerNameInput.value, timeToFinishLevel).then(data => {
                apiSendInAction = false;
                if (level.levelNumber === 2) {
                    goToCredits();
                } else {
                    goToNextLevel(level.levelNumber + 1)
                }
            });
        } else {
            document.getElementById('error-message').classList.remove('invisible');
        }
    }
}

function touchStarted() {
    getAudioContext().resume();
    keyPressed();
}

// -------------------------------------------------------------------
// ------------------------------------------------ Init
// -------------------------------------------------------------------

window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;
window.preload = preload;
window.touchStarted = touchStarted;
window.tryToGoToNextLevel = tryToGoToNextLevel;
// eslint-disable-next-line eol-last
window.tryToQuit = tryToQuit;