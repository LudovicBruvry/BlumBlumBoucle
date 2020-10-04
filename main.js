// eslint-disable-next-line import/extensions
import { getDistance, findCircleLineIntersections, intersects, getOrbitAngle, findLinesIntersection, getArrayMin, splitPointsIntoLines } from './mathHelpers.js';

const SHOW_ORBITS = true;
const canvasWidth = 1920;
const canvasHeight = 933;
const planets = [
  { x: 100, y: 450, size: 15, color: '#F0F', orbitDistance: 50 },
  { x: 100, y: 575, size: 15, color: '#0FF', orbitDistance: 50 },
  { x: 100, y: 700, size: 15, color: '#0FF', orbitDistance: 50 },
  { x: 100, y: 825, size: 15, color: '#FF0', orbitDistance: 50 },
  { x: 100, y: 100, size: 15, color: '#FF0', orbitDistance: 50 },
  { x: 450, y: 220, size: 350, color: 'green', orbitDistance: 50, isEnd: true },
  { x: 800, y: 50, size: 30, color: '#FF0', orbitDistance: 50 },
  { x: 1250, y: 125, size: 150, color: '#FF0', orbitDistance: 50 },
  { x: 1250, y: 400, size: 200, color: '#FF0', orbitDistance: 50 },
  { x: 775, y: 350, size: 200, color: '#FF0', orbitDistance: 50 },
  { x: 1800, y: 75, size: 15, color: '#FF0', orbitDistance: 50 },
  { x: 1800, y: 200, size: 15, color: '#FF0', orbitDistance: 50 },
  { x: 1800, y: 325, size: 15, color: '#FF0', orbitDistance: 50 },
  { x: 1850, y: 450, size: 15, color: '#F0F', orbitDistance: 50 },
  { x: 1825, y: 825, size: 60, color: '#FF0', orbitDistance: 50 },
  { x: 1600, y: 825, size: 15, color: '#FF0', orbitDistance: 50 },
  { x: 1450, y: 700, size: 15, color: '#FF0', orbitDistance: 50 },
  { x: 1300, y: 575, size: 15, color: '#FF0', orbitDistance: 50 },
  { x: 900, y: 575, size: 15, color: '#FF0', orbitDistance: 50 },
  { x: 500, y: 500, size: 10, color: '#FF0', orbitDistance: 30 },
  { x: 300, y: 825, size: 15, color: '#FF0', orbitDistance: 50 },
  { x: 500, y: 750, size: 150, color: '#FF0', orbitDistance: 50 },
  { x: 700, y: 650, size: 150, color: '#FF0', orbitDistance: 50 },
];

const asteroidLines = [
  { points: [{ x: 100, y: 500 }, { x: 400, y: 510 }, { x: 500, y: 430 }, { x: 1200, y: 600 }] },
];

const orbitSpeed = 0.3;
const spaceSpeed = 8;
const ship = {
  x: 400,
  y: 400,
  speed: orbitSpeed,
  orientation: 0,
  planetAngle: -Math.PI,
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
let explodeSound1;
let explodeSound2;

function preload() {
  shipEngineSound = loadSound('./Assets/Sound/MoteurVaisseau.mp3');
  boostSound = loadSound('./Assets/Sound/Boost.mp3');
  explodeSound1 = loadSound('./Assets/Sound/explode1.mp3');
  explodeSound2 = loadSound('./Assets/Sound/explode2.mp3');
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

function drawPlanet(_x, _y, _size, _color, _orbit) {
  fill(color(_color));
  noStroke();
  ellipse(_x, _y, _size, _size);
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
  planets.forEach(({ x, y, size, color, orbitDistance }) => {
    drawPlanet(x, y, size, color, orbitDistance);
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

  if (ship.x < 0 || ship.x > canvasWidth) gameover();
  if (ship.y < 0 || ship.y > canvasWidth) gameover();
  if (ship.deadPlanetIndex > -1 && deadPlanetDistance < deadPlanet.size / 2) gameover();
  if (deadPointDistance < 1) gameover();
}

function moveShipInOrbit() {
  const planet = planets[ship.planetIndex];
  const { x, y, size, orbitDistance } = planet;
  const o = ship.planetAngle;
  const dr = (size + orbitDistance) / 2;
  const dx = dr * cos(o);
  const dy = dr * sin(o);
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

  handleAsteroidLinesTrajectory(dx, dy);
  if (ship.isDead) {
    return;
  }

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
    ship.speed = orbitSpeed;
    ship.isDead = false;
    ship.isOrbitValidated = false;
    ship.planetAngle = ship.anchorPoint.planetAngle;
    ship.clockwise = ship.anchorPoint.clockwise;
    const planet = planets[ship.planetIndex];
    if (planet.isEnd) levelEnd();
  }
}

function compute() {
  moveShip();
  attachShipToNextPlanet();
}

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  setInterval(compute, 10);
  playShipEngineSound();
}

function playShipEngineSound() {
  getAudioContext().resume();
  shipEngineSound.setVolume(0.08);
  shipEngineSound.loop();
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

function draw() {
  background(220);
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