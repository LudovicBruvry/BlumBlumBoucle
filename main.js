// eslint-disable-next-line import/extensions
import { getDistance, findCircleLineIntersections, intersects, getOrbitAngle } from './mathHelpers.js';

const SHOW_ORBITS = true;
const SHOW_RAYS = true;

const planets = [
  { x: 300, y: 400, size: 80, color: '#F0F', orbitDistance: 50 },
  { x: 600, y: 700, size: 60, color: '#0FF', orbitDistance: 50 },
  { x: 600, y: 200, size: 60, color: '#0FF', orbitDistance: 50 },
  { x: 200, y: 100, size: 15, color: '#FF0', orbitDistance: 50 },
  { x: 200, y: 700, size: 15, color: '#FF0', orbitDistance: 50 },
];

const orbitSpeed = 0.5;
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
  anchorPoint: { planetAngle: 0, clockwise: true, point: null },
  color: 'white',
};

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

  planets.forEach(({ x, y, size, orbitDistance }, index) => {
    if (index === ship.planetIndex) {
      return; // No need to draw raysfor the beetween the planet where the ship is
    }
    const r = (size + orbitDistance + orbitDistance) / 2;
    const r2 = size / 2;
    const im = (y - ship.y) / (x - ship.x);
    const m = -1 / im;
    const n = y - (m * x);
    const ptsOuterOrbit = findCircleLineIntersections(r, x, y, m, n);
    const ptsInnerCircle = findCircleLineIntersections(r2, x, y, m, n);
    const dx = ship.x + (1000 * cos(ship.orientation));
    const dy = ship.y + (1000 * sin(ship.orientation));

    // SUCCES
    const isIntersectingWithRightCirclePoint = intersects(ptsOuterOrbit[0].x, ptsOuterOrbit[0].y, ptsInnerCircle[0].x, ptsInnerCircle[0].y, ship.x, ship.y, dx, dy);
    if (isIntersectingWithRightCirclePoint) stroke(color('blue'));
    if (SHOW_RAYS) {
      stroke(color('#AAA'));
      line(ptsOuterOrbit[0].x, ptsOuterOrbit[0].y, ptsInnerCircle[0].x, ptsInnerCircle[0].y);
    }

    const isIntersectingWithLeftCirclePoint = intersects(ptsOuterOrbit[1].x, ptsOuterOrbit[1].y, ptsInnerCircle[1].x, ptsInnerCircle[1].y, ship.x, ship.y, dx, dy);
    if (isIntersectingWithLeftCirclePoint) stroke(color('#0F0'));
    if (SHOW_RAYS) {
      stroke(color('#AAA'));
      line(ptsOuterOrbit[1].x, ptsOuterOrbit[1].y, ptsInnerCircle[1].x, ptsInnerCircle[1].y);
    }

    // MORT
    const isIntersectingWithPlanet = intersects(ptsInnerCircle[0].x, ptsInnerCircle[0].y, ptsInnerCircle[1].x, ptsInnerCircle[1].y, ship.x, ship.y, dx, dy);
    if (isIntersectingWithPlanet) stroke(color('#F00'));
    if (SHOW_RAYS) {
      stroke(color('#AAA'));
      line(ptsInnerCircle[0].x, ptsInnerCircle[0].y, ptsInnerCircle[1].x, ptsInnerCircle[1].y);
    }

    if (isIntersectingWithPlanet) {
      ship.color = 'red';
    } else if (isIntersectingWithRightCirclePoint || isIntersectingWithLeftCirclePoint) {
      ship.color = 'green';
    } else {
      ship.color = 'white';
    }
  });

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
  const planetOrigin = planets[ship.planetIndex];

  // Nose ray
  resetMatrix();
  stroke(color('#000'));
  translate(ship.x, ship.y);
  rotate(ship.orientation);
  line(0, 0, 2000, 0);

  resetMatrix();
  stroke(color('#AAA'));
  ship.isOrbitValidated = false;
  ship.isDead = false;
  resetMatrix();

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

    if (isIntersectingWithOrbit1 || isIntersectingWithOrbit2) {
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
  ship.speed = spaceSpeed;
}

function attachShipToNextPlanet() {
  if (ship.nextPlanetIndex < 0) {
    return;
  }
  const distanceBetweenShipAndNextPlanet = getDistance(ship.x, ship.y, ship.anchorPoint.point.x, ship.anchorPoint.point.y);

  if (distanceBetweenShipAndNextPlanet < 1) {
    ship.planetIndex = ship.nextPlanetIndex;
    ship.nextPlanetIndex = -1;
    ship.speed = orbitSpeed;
    ship.isDead = false;
    ship.isOrbitValidated = false;
    ship.planetAngle = ship.anchorPoint.planetAngle;
    ship.clockwise = ship.anchorPoint.clockwise;
  }
}

function compute() {
  moveShip();
  attachShipToNextPlanet();
}

function setup() {
  createCanvas(800, 800);
  setInterval(compute, 10);
}

function draw() {
  background(220);
  drawPlanets();
  drawRays();
  drawShip();
}

function keyPressed() {
  calculateShipTrajectory();
  ship.planetIndex = -1;
}

window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;
