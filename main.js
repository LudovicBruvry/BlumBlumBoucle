// eslint-disable-next-line import/extensions
import { getDistance, findCircleLineIntersections, intersects, getOrbitAngle, findLinesIntersection, getArrayMin, splitPointsIntoLines } from './mathHelpers.js';

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
  planetAngle: -Math.PI / 4,
  planetIndex: 0,
  clockwise: true,
  isDead: false,
  isOrbitValidated: false,
  nextPlanetIndex: -1,
  deadPlanetIndex: -1,
  deadPoint: null,
  anchorPoint: { planetAngle: 0, clockwise: true, point: null },
  color: 'white',
};
let lastShipPlanetIndex = 0;

/*
let usedPlanetForTrajectory = null;
let usedSensForTrajectory = 1; // 1->up, 0->isOk, -1->down
*/

let shipEngineSound;
let boostSound;
let explodeSound2;
let levelMusic;
let images;

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
  ship.deadPoint = null;
  ship.deadPlanetIndex = -1;
  playExplosion();
}

function levelEnd() {
  isChronoEnded = true;
  chronoEnd = Date.now();
  const diff = chronoEnd - chronoStart;
  timeToFinishLevel = convertTimeDiff(diff);
  displayLevelEndModal();
}

function convertTimeDiff(diff){
  const dateDiff = new Date(diff);
  return (dateDiff.getSeconds() + 60 * dateDiff.getMinutes());
}


function displayChrono() {
  if (!isChronoEnded) {
    chronoCurrent = Date.now();
    const diff = chronoCurrent - chronoStart;
    const seconds = convertTimeDiff(diff);
    document.getElementById('chrono').innerHTML = `${seconds}`;
  }
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
function getPositionAlongTheLine(x1, y1, x2, y2, percentage) {
  return { x: x1 * (1.0 - percentage) + x2 * percentage, y: y1 * (1.0 - percentage) + y2 * percentage };
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

function moveShipInSpace() {
  const o = ship.orientation;
  let dr = ship.speed;

  const nextTargetList = [ship.speed];
  let deadPlanet = null;
  let deadPlanetDistance = Infinity;
  let deadPointDistance = Infinity;

  if (ship.anchorPoint.point !== null) nextTargetList.push(parseInt(getDistance(ship.x, ship.y, ship.anchorPoint.point.x, ship.anchorPoint.point.y), 10));
  if (ship.deadPlanetIndex > -1) {
    deadPlanet = planets[ship.deadPlanetIndex];
    deadPlanetDistance = parseInt(getDistance(ship.x, ship.y, deadPlanet.x, deadPlanet.y), 10);
    nextTargetList.push(deadPlanetDistance);
  }
  if (ship.deadPoint !== null) {
    deadPointDistance = parseInt(getDistance(ship.x, ship.y, ship.deadPoint.x, ship.deadPoint.y), 10);
    nextTargetList.push(deadPointDistance);
  }

  dr = Math.min(...nextTargetList);
  const dx = dr * cos(o);
  const dy = dr * sin(o);
  ship.x += dx;
  ship.y += dy;

  if (ship.deadPlanetIndex > -1) {
    deadPlanetDistance = parseInt(getDistance(ship.x, ship.y, deadPlanet.x, deadPlanet.y), 10);
    if (deadPlanetDistance < deadPlanet.size / 2) gameover();
  }
  if (ship.deadPoint !== null) {
    deadPointDistance = parseInt(getDistance(ship.x, ship.y, ship.deadPoint.x, ship.deadPoint.y), 10);
    if (deadPointDistance < ship.speed) gameover();
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

function computeClockwise(_ship, _planet, _anchor) {
  const slopeShipPlanet = (_planet.y - _ship.y) / (_planet.x - _ship.x);
  const slopeShipAnchor = (_anchor.y - _ship.y) / (_anchor.x - _ship.x);

  return slopeShipAnchor < slopeShipPlanet;
}

function handleAsteroidLinesTrajectory(dx, dy) {
  const deadAsteroidPoints = [];

  asteroidLines.forEach((asteroidLine) => {
    splitPointsIntoLines(asteroidLine.points).forEach((line) => {
      const isIntesecting = intersects(line.a.x, line.a.y, line.b.x, line.b.y, ship.x, ship.y, dx, dy);
      if (isIntesecting) {
        const intersection = findLinesIntersection({ x: ship.x, y: ship.y }, { x: dx, y: dy }, line.a, line.b);
        ship.isDead = true;
        deadAsteroidPoints.push(intersection);
      }
    });
  });

  if (deadAsteroidPoints.length < 1) return;

  ship.deadPoint = getArrayMin(deadAsteroidPoints, (point) => getDistance(ship.x, ship.y, point.x, point.y));
  ship.isDead = true;
}

/*
function isUpDownOrEqualTrajectory(lineMedium) {
  var intersectWithPlanet = findCircleLinePointsIntersections(
    usedPlanetForTrajectory.r, usedPlanetForTrajectory.x, usedPlanetForTrajectory.y,
    { x: ship.x, y: ship.y }, lineMedium.b);

  if (intersectWithPlanet.length < 1) return 0; // Perfect Trajectory
  return usedSensForTrajectory;
}

function calculateSensForTrajectory(planet){
  var shipPos = ship.x + (-1 * ship.y);
  var planetPos = planet.x + (-1 * planet.y);

  return shipPos < planetPos ? 1 : -1;
}
*/

function calculateShipTrajectory() {
  let deadPlanetDistance = Infinity;
  let validOrbitDistance = Infinity;
  const dx = ship.x + (1000 * cos(ship.orientation));
  const dy = ship.y + (1000 * sin(ship.orientation));

  ship.isDead = false;
  ship.speed = spaceSpeed;
  ship.acceleration = -0.1;

  handleAsteroidLinesTrajectory(dx, dy);

  planets.forEach((planet, index) => {
    const { x, y, size, orbitDistance } = planet;

    if (index === ship.planetIndex) {
      return; // No need to check collision beetween the planet where the ship is
    }

    const r = (size + orbitDistance + orbitDistance) / 2;
    const r2 = size / 2;
    const r3 = (size + orbitDistance) / 2;
    const im = (y - ship.y) / (x - ship.x);
    const m = -1 / im;
    const n = y - (m * x);
    const ptsOuterOrbit = findCircleLineIntersections(r, x, y, m, n);
    const ptsInnerCircle = findCircleLineIntersections(r2, x, y, m, n);
    const ptsInnerOrbit = findCircleLineIntersections(r3, x, y, m, n);

    // SUCCES
    const isIntersectingWithOrbit1 = intersects(ptsOuterOrbit[0].x, ptsOuterOrbit[0].y, ptsInnerCircle[0].x, ptsInnerCircle[0].y, ship.x, ship.y, dx, dy);
    const isIntersectingWithOrbit2 = intersects(ptsOuterOrbit[1].x, ptsOuterOrbit[1].y, ptsInnerCircle[1].x, ptsInnerCircle[1].y, ship.x, ship.y, dx, dy);
    const isIntersectingWithPlanet = intersects(ptsInnerCircle[0].x, ptsInnerCircle[0].y, ptsInnerCircle[1].x, ptsInnerCircle[1].y, ship.x, ship.y, dx, dy);

    const distance = getDistance(ship.x, ship.y, planet.x, planet.y);
    if (isIntersectingWithPlanet) {
      if (distance < deadPlanetDistance) {
        deadPlanetDistance = distance;
        ship.deadPlanetIndex = index;
      }
    }

    if (isIntersectingWithOrbit1 || isIntersectingWithOrbit2) {
      if (distance > validOrbitDistance) {
        return;
      }

      validOrbitDistance = distance;
      ship.isOrbitValidated = true;
      ship.nextPlanetIndex = index;

      const anchorPoint = isIntersectingWithOrbit1
        ? { x: ptsInnerOrbit[0].x, y: ptsInnerOrbit[0].y }
        : { x: ptsInnerOrbit[1].x, y: ptsInnerOrbit[1].y };

      ship.orientation = getOrbitAngle({ x: ship.x, y: ship.y }, anchorPoint);

      ship.anchorPoint = { planetAngle: getOrbitAngle(planet, anchorPoint), clockwise: true, point: anchorPoint };

      // calculate anchor point clockwise
      ship.anchorPoint.clockwise = computeClockwise(ship, planet, ship.anchorPoint.point);
    }
    ship.isDead = ship.isDead || isIntersectingWithPlanet;
  });

  ship.isDead = ship.isDead || !ship.isOrbitValidated;
}

function attachShipToNextPlanet() {
  if (ship.nextPlanetIndex < 0) {
    return;
  }
  const distanceBetweenShipAndNextPlanet = getDistance(ship.x, ship.y, ship.anchorPoint.point.x, ship.anchorPoint.point.y);

  if (distanceBetweenShipAndNextPlanet < 1) {
    ship.planetIndex = ship.nextPlanetIndex;
    lastShipPlanetIndex = ship.planetIndex;
    ship.nextPlanetIndex = -1;
    // ship.speed = orbitSpeed;
    ship.isDead = false;
    ship.isOrbitValidated = false;
    ship.planetAngle = ship.anchorPoint.planetAngle;
    ship.clockwise = ship.anchorPoint.clockwise;
    ship.anchorPoint.point = null;
    const planet = planets[ship.planetIndex];
    if (planet.isEnd) levelEnd();
  }
}

function compute() {
  moveShip();
  attachShipToNextPlanet();
}

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

function setBackground() {
  levelBackground = loadImage(level.background);
}

function initChronoMeter() {
  chronoStart = Date.now();
  chronoCurrent = Date.now();
  chronoEnd = Date.now();
  isChronoEnded = false;
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

function setup() {
  setBackground();
  createCanvas(canvasWidth, canvasHeight);
  setInterval(compute, 10);
  playShipEngineSound();
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
}

function keyPressed() {
  if(!isChronoEnded){
    calculateShipTrajectory();
    playBoost();
    ship.planetIndex = -1;
  }

}

function displayLevelEndModal(){
  const levelEndModalElement = document.getElementById("levelEndModal");
  if(levelEndModalElement){
    levelEndModalElement.classList.remove("invisible");
  }

  const chronoEndElement = document.getElementById("chronoEnd");
  if(chronoEndElement) {
    chronoEndElement.innerHTML = "" + timeToFinishLevel + " seconds";
  }
}

function tryToQuit(){
  if(!apiSendInAction){
    const playerNameIsValid = checkPlayerName();
    if(playerNameIsValid){
      document.getElementById("error-message").classList.add("invisible");
      const playerNameInput = document.getElementById("playerNameInput");
      apiSendInAction = true;
      postHighScoresViaAPI(level.levelNumber, playerNameInput.value, timeToFinishLevel).then(data => {
        apiSendInAction = false;
        window.location.href = "/";
      });
    }
    else{
      document.getElementById("error-message").classList.remove("invisible");
    }
  }

}

function tryToGoToNextLevel(){
  if(!apiSendInAction){
    const playerNameIsValid = checkPlayerName();
    if(playerNameIsValid){
      document.getElementById("error-message").classList.add("invisible");
      const playerNameInput = document.getElementById("playerNameInput");
      apiSendInAction = true;
      postHighScoresViaAPI(level.levelNumber, playerNameInput.value, timeToFinishLevel).then(data => {
        apiSendInAction = false;
        if(level.levelNumber == 2){
          goToCredits();
        }else{
          goToNextLevel(level.levelNumber+1)
        }

      });
    }
    else{
      document.getElementById("error-message").classList.remove("invisible");
    }
  }
}

function goToNextLevel(levelToLoad){

  switch(levelToLoad){
    case 1:
      document.location.href='/game-level1.html';
      break;
    case 2:
      document.location.href='/game-level2.html';
      break;
    default:
      goToCredits();
      break;
  }
}

function goToCredits(){
  document.location.href='/thecrew.html';
}

function checkPlayerName(){
  let playerNameInput = document.getElementById("playerNameInput");
  if(playerNameInput){
    if(playerNameInput.value){
      return true;
    }
  }
  return false;
}

function postHighScoresViaAPI(level, playerName, time) {

  return new Promise((resolve, reject) => {

    var request = new XMLHttpRequest();

    request.open('POST', 'https://scoreback.herokuapp.com', true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.onload = () => {
      if(request.status >= 200 && request.status < 300) {
        resolve(request.response);
      }
      else
      {
        reject('Error');
      }
    }
    request.send("level="+level+"&playerName="+ playerName+"&time="+time);
  });
}

function touchStarted() {
  getAudioContext().resume();
  keyPressed();
}

window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;
window.preload = preload;
window.touchStarted = touchStarted;
window.tryToGoToNextLevel = tryToGoToNextLevel;
window.tryToQuit = tryToQuit;
