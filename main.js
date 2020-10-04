// eslint-disable-next-line import/extensions
import { getDistance, findCircleLineIntersections, intersects, getOrbitAngle } from './mathHelpers.js';

const SHOW_ORBITS = true;
const canvasWidth = 1920;
const canvasHeight = 933;

const asteroidLines = [
  { points: [{ x: 100, y: 500 }, { x: 400, y: 510 }, { x: 500, y: 430 }, { x: 1200, y: 600 }] },
];
const level = window.level;
let planets = level.planets;

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
  anchorPoint: { planetAngle: 0, clockwise: true, point: null },
  color: 'white',
};
let lastShipPlanetIndex = 0;

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
    let lastPoint = asteroidLine.points[0];
    // eslint-disable-next-line no-plusplus
    for (let index = 1; index < asteroidLine.points.length; index++) {
      const point = asteroidLine.points[index];
      drawAsteroidLine(lastPoint, point);
      lastPoint = point;
    }
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
  if (ship.anchorPoint.point !== null) {
    const distanceBetweenShipAndNextPlanet = getDistance(ship.x, ship.y, ship.anchorPoint.point.x, ship.anchorPoint.point.y);
    dr = Math.min(distanceBetweenShipAndNextPlanet, dr);
  }
  const dx = dr * cos(o);
  const dy = dr * sin(o);
  ship.x += dx;
  ship.y += dy;

  if (ship.x < 0 || ship.x > canvasWidth) {
    gameover();
  }
  if (ship.y < 0 || ship.y > canvasWidth) {
    gameover();
  }

  if (ship.deadPlanetIndex > -1) {
    const deadPlanet = planets[ship.deadPlanetIndex];
    const distanceBetweenShipAndPlanet = getDistance(ship.x, ship.y, deadPlanet.x, deadPlanet.y);
    if (distanceBetweenShipAndPlanet < deadPlanet.size / 2) gameover();
  }
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

function calculateShipTrajectory() {
  let deadPlanetDistance = Infinity;
  let validOrbitDistance = Infinity;

  ship.isDead = false;
  ship.speed = spaceSpeed;

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
    const dx = ship.x + (1000 * cos(ship.orientation));
    const dy = ship.y + (1000 * sin(ship.orientation));

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

function playShipEngineSound() {
  getAudioContext().resume();
  shipEngineSound.setVolume(0.08);
  shipEngineSound.loop();
}

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  setInterval(compute, 10);
  playShipEngineSound();
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