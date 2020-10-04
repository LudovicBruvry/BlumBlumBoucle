// eslint-disable-next-line import/extensions
import { getDistance, getPerpendicularAtRayon, getCorrectLineBetween2Lines, findCircleLinePointsIntersections, intersects, getOrbitAngle, findLinesIntersection, getArrayMin, splitPointsIntoLines } from './mathHelpers.js';

const SHOW_ORBITS = true;
const canvasWidth = 1920;
const canvasHeight = 933;

const level = window.level;
let planets = level.planets;
let asteroidLines = level.asteroidLines;
let levelMusicPath = level.music;
let levelBackground = 220;

const orbitSpeed = 0.3;
const spaceSpeed = 8;
const ship = {
  x: 400,
  y: 400,
  speed: orbitSpeed,
  acceleration: 0,
  orientation: 0,
  planetAngle: .7,
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
let usedPlanetForTrajectory = null;
let usedSensForTrajectory = 1; // 1->up, 0->isOk, -1->down

let shipEngineSound;
let boostSound;
let explodeSound1;
let explodeSound2;
let levelMusic;
let images;

function preload() {
  shipEngineSound = loadSound('./Assets/Sound/MoteurVaisseau.mp3');
  levelMusic = loadSound(levelMusicPath);
  boostSound = loadSound('./Assets/Sound/boost3.wav');
  explodeSound1 = loadSound('./Assets/Sound/explode1.mp3');
  explodeSound2 = loadSound('./Assets/Sound/explode2.mp3');
  images = {
    crateres: loadImage('./Assets/Sprites/Crateres/c0.png'),
    earth: loadImage('./Assets/Sprites/Earth/PE001.png'),
    saumon: loadImage('./Assets/Sprites/Saumon/S01.png'),
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

function touchStarted() {
  getAudioContext().resume();
}

function gameover() {
  ship.planetIndex = lastShipPlanetIndex;
  ship.speed = orbitSpeed;
  ship.deadPoint = null;
  ship.deadPlanetIndex = -1;
  playExplosion();
}

function levelEnd() {
  console.log('Con grat ulation !');
}

function drawPlanet(_x, _y, _size, _color, i, _orbit) {
  if (i) {
    image(images[i], _x - (_size / 2), _y - (_size / 2), _size, _size);
  } else {
    fill(color(_color));
    noStroke();
    ellipse(_x, _y, _size, _size);
  }

  if (SHOW_ORBITS) {
    noFill();
    stroke(color('#000'));
    ellipse(_x, _y, _size + _orbit, _size + _orbit);
  }
}

function drawAsteroidLine(pointA, pointB) {
  stroke(color('black'));
  line(pointA.x, pointA.y, pointB.x, pointB.y);
}

function drawAsteroidLines() {
  asteroidLines.forEach((asteroidLine) => {
    splitPointsIntoLines(asteroidLine.points).forEach(line => {
      drawAsteroidLine(line.a, line.b);
    });
  });
}

function drawPlanets() {
  planets.forEach(({ x, y, size, color, image, orbitDistance }) => {
    drawPlanet(x, y, size, color, image, orbitDistance);
  });
}

function drawShip() {
  resetMatrix();
  translate(ship.x, ship.y);
  rotate(ship.orientation);

  fill(color(ship.color));
  stroke(color('#000'));
  triangle(10, 0, -5, -5, -5, 5);
}

function getShipLine() {
  const dx = ship.x + (1000 * cos(ship.orientation));
  const dy = ship.y + (1000 * sin(ship.orientation));
  return {
    a: { x: ship.x, y: ship.y },
    b: { x: dx, y: dy }
  };
}

function getShipConeLines() {
  var shipPoint = { x: ship.x, y: ship.y };
  const dx = ship.x + (500 * cos(ship.orientation));
  const dy = ship.y + (500 * sin(ship.orientation));
  const endPoint = { x: dx, y: dy };

  var perpendicular = getPerpendicularAtRayon({ a: shipPoint, b: endPoint }, shipPoint, 37.5);
  return [
    { a: { x: perpendicular[0].x, y: perpendicular[0].y }, b: endPoint },
    { a: { x: perpendicular[1].x, y: perpendicular[1].y }, b: endPoint }
  ];
}

function drawRays() {
  if (ship.planetIndex < 0) return;

  stroke(color('white'));
  var lines = [];
  lines.push(getShipLine());
  //lines = lines.concat(getShipConeLines());

  lines.forEach((lineObject) => {
    line(lineObject.a.x, lineObject.a.y, lineObject.b.x, lineObject.b.y);
  });

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

function validTrajectory(planet, planetIndex, intersectionWithOrbit){
  ship.isOrbitValidated = true;
  ship.nextPlanetIndex = planetIndex;

  const shipPoint = { x: ship.x, y: ship.y };
  const planetPoint = { x: planet.x, y: planet.y };
  const anchorPoint = getArrayMin(intersectionWithOrbit, (point) => getDistance(ship.x, ship.y, point.x, point.y));
  ship.orientation = getOrbitAngle(shipPoint, anchorPoint);

  let clockwise = computeClockwise(shipPoint, planetPoint, anchorPoint);
  //var planetScore = planetPoint.x + (-1 * planetPoint.y);
  //var shipScore = ship.x + (-1 * ship.y);
  //var anchorScore = anchorPoint.x + (-1 * anchorPoint.y);

  //if(anchorScore < shipScore) clockwise = true;
  //if(anchorScore < planetScore) clockwise != clockwise;
  ship.anchorPoint = { planetAngle: getOrbitAngle(planet, anchorPoint), clockwise: clockwise, point: anchorPoint };
}

function handlePlanetConeTrajectory(planet, planetIndex, coneLines)
{
  coneLines.forEach(lineObject => {
    lineObject.intersectionWithPlanet = findCircleLinePointsIntersections(planet.size / 2, planet.x, planet.y, lineObject.a, lineObject.b);
    lineObject.intersectionWithOrbit = findCircleLinePointsIntersections((planet.size + planet.orbitDistance) / 2, planet.x, planet.y, lineObject.a, lineObject.b);
  });

  var line1 = coneLines[0];
  var line2 = coneLines[1];

  if(line1.intersectionWithPlanet.length > 0 && line2.intersectionWithPlanet.length > 0){
    deadPlanetDistance = distance;
    ship.deadPlanetIndex = planetIndex;
    return;
  }

  if(line1.intersectionWithOrbit.length < 1 && line2.intersectionWithOrbit.length < 1){
    return;
  }

  const onlyOneLineTouchPlanet =
       line1.intersectionWithPlanet.length > 0 && line2.intersectionWithPlanet.length < 1
    || line1.intersectionWithPlanet.length < 1 && line2.intersectionWithPlanet.length > 0;

  const touchOrbitButNotPlanet =
       (line1.intersectionWithPlanet.length < 1 && line2.intersectionWithPlanet.length < 1)
    && (line1.intersectionWithOrbit.length  > 0 || line2.intersectionWithOrbit.length  > 0);

  if(onlyOneLineTouchPlanet || touchOrbitButNotPlanet){
    let lineMedium = null;
    if(line1.intersectionWithPlanet.length < 1 && line1.intersectionWithOrbit.length > 0){
      lineMedium = line1;
    }
    else if(line2.intersectionWithPlanet.length < 1 && line2.intersectionWithOrbit.length > 0){
      lineMedium = line2;
    }
    else{
      usedPlanetForTrajectory = planet;
      usedSensForTrajectory = calculateSensForTrajectory(planet);
      mediumLine = getCorrectLineBetween2Lines(line1, line2, usedSensForTrajectory, isUpDownOrEqualTrajectory);
    }

    const anchorList = findCircleLinePointsIntersections(
      (planet.size + planet.orbitDistance) / 2, planet.x, planet.y,
      lineMedium.a, lineMedium.b);

    validTrajectory(planet, planetIndex, anchorList);
    return anchorList.length > 0;
  }
}

function isUpDownOrEqualTrajectory(lineMedium) {
  var intersectWithPlanet = findCircleLinePointsIntersections(
    usedPlanetForTrajectory.size / 2, usedPlanetForTrajectory.x, usedPlanetForTrajectory.y,
    lineMedium.a, lineMedium.b);

  var intersectWithOrbit = findCircleLinePointsIntersections(
    (usedPlanetForTrajectory.size + usedPlanetForTrajectory.orbitDistance) / 2, usedPlanetForTrajectory.x, usedPlanetForTrajectory.y,
    lineMedium.a, lineMedium.b);

  if (intersectWithPlanet.length < 1 && intersectWithOrbit.length > 0) return 0; // Perfect Trajectory
  return usedSensForTrajectory;
}

function calculateSensForTrajectory(planet) {
  var shipPos = ship.x + (-1 * ship.y);
  var planetPos = planet.x + (-1 * planet.y);

  return shipPos < planetPos ? 1 : -1;
}

function handlePlanetsTrajectory(dx, dy) {
  let deadPlanetDistance = Infinity;
  let validOrbitDistance = Infinity;
  var shipLine = getShipLine();
  var shipConeLines = getShipConeLines();

  planets.forEach((planet, planetIndex) => {
    const { x, y, size, orbitDistance } = planet;

    if (planetIndex === ship.planetIndex) {
      return; // No need to check collision beetween the planet where the ship is
    }

    const distance = getDistance(ship.x, ship.y, planet.x, planet.y);
    if (distance > deadPlanetDistance || distance > validOrbitDistance) {
      return; // No need to check collision beetween this planet because the ship will colide with an another planet before this one
    }

    const intersectionWithPlanet = findCircleLinePointsIntersections(planet.size / 2, planet.x, planet.y, shipLine.a, shipLine.b);
    const intersectionWithOrbit = findCircleLinePointsIntersections((planet.size + planet.orbitDistance) / 2, planet.x, planet.y, shipLine.a, shipLine.b);
    if(intersectionWithPlanet.length === 0 && intersectionWithOrbit.length >= 1){
      validOrbitDistance = distance;
      validTrajectory(planet, planetIndex, intersectionWithOrbit);
      return;
    }

    var isOk = handlePlanetConeTrajectory(planet, planetIndex, shipConeLines);
    if(isOk) validOrbitDistance = distance;
  });

  ship.isDead = ship.isDead || !ship.isOrbitValidated;
}

function calculateShipTrajectory() {
  let dx = ship.x + (1000 * cos(ship.orientation));
  let dy = ship.y + (1000 * sin(ship.orientation));

  ship.isDead = false;
  ship.speed = spaceSpeed;
  ship.acceleration = -0.1;

  handlePlanetsTrajectory(dx, dy);

  // dx and dy may have changed
  dx = ship.x + (1000 * cos(ship.orientation));
  dy = ship.y + (1000 * sin(ship.orientation));
  handleAsteroidLinesTrajectory(dx, dy);
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

function setup() {
  setBackground();
  createCanvas(canvasWidth, canvasHeight);
  setInterval(compute, 10);
  playShipEngineSound();
  playLevelMusic();
}

function setBackground() {
  levelBackground = loadImage(level.background);
}

function draw() {
  background(levelBackground);
  drawAsteroidLines();
  drawPlanets();
  drawRays();
  drawShip();
}

function keyPressed() {
  calculateShipTrajectory();
  playBoost();
  ship.planetIndex = -1;
}

window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;
window.preload = preload;
window.touchStarted = touchStarted;