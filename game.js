// eslint-disable-next-line import/extensions
import { getDistance, findCircleLineIntersections, intersects, getOrbitAngle } from './mathHelpers.js';

import { level_1 as planets } from './Levels/level_1.js';


class Game {
  SHOW_ORBITS = true;
  SHOW_RAYS = true;
  orbitSpeed = 1;
  spaceSpeed = 8;

  ship = {
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
    accrochPoint: { planetAngle: 0, clockwise: true },
    color: 'white',
  };
  
  static drawPlanet(_x, _y, _size, _color, _orbit) {
    fill(color(_color));
    noStroke();
    ellipse(_x, _y, _size, _size);
    if (SHOW_ORBITS) {
      noFill();
      stroke(color('#000'));
      ellipse(_x, _y, _size + _orbit, _size + _orbit);
    }
  }
  
  static drawPlanets() {
    planets.forEach(({ x, y, size, color, orbitDistance }) => {
      drawPlanet(x, y, size, color, orbitDistance);
    });
  }
  
  static drawShip() {
    resetMatrix();
    translate(ship.x, ship.y);
    rotate(ship.orientation);
  
    fill(color(ship.color));
    stroke(color('#000'));
    triangle(10, 0, -5, -5, -5, 5);
  }
  
  static drawRays() {
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
      const pts = findCircleLineIntersections(r, x, y, m, n);
      const pts2 = findCircleLineIntersections(r2, x, y, m, n);
      const y0 = m * pts[0] + n;
      const y1 = m * pts[1] + n;
      const y2 = m * pts2[0] + n;
      const y3 = m * pts2[1] + n;
      const dx = ship.x + (1000 * cos(ship.orientation));
      const dy = ship.y + (1000 * sin(ship.orientation));
  
      // SUCCES
      const isIntersectingWithRightCirclePoint = intersects(pts[0], y0, pts2[0], y2, ship.x, ship.y, dx, dy);
      if (isIntersectingWithRightCirclePoint) stroke(color('blue'));
      if (SHOW_RAYS) {
        stroke(color('#AAA'));
        line(pts[0], y0, pts2[0], y2);
      }
  
      const isIntersectingWithLeftCirclePoint = intersects(pts[1], y1, pts2[1], y3, ship.x, ship.y, dx, dy);
      if (isIntersectingWithLeftCirclePoint) stroke(color('#0F0'));
      if (SHOW_RAYS) {
        stroke(color('#AAA'));
        line(pts[1], y1, pts2[1], y3);
      }
  
      // MORT
      const isIntersectingWithPlanet = intersects(pts2[0], y2, pts2[1], y3, ship.x, ship.y, dx, dy);
      if (isIntersectingWithPlanet) stroke(color('#F00'));
      if (SHOW_RAYS) {
        stroke(color('#AAA'));
        line(pts2[0], y2, pts2[1], y3);
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
  
  static moveShipInSpace() {
    const o = ship.orientation;
    const dr = ship.speed;
    const dx = dr * cos(o);
    const dy = dr * sin(o);
    ship.x += dx;
    ship.y += dy;
  }
  
  static moveShipInOrbit() {
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
  
  static moveShip() {
    if (ship.planetIndex < 0) {
      moveShipInSpace();
    } else {
      moveShipInOrbit();
    }
  }
  
  static calculateShipTrajectory() {
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
      const { x } = planet;
      const { y } = planet;
      const { size } = planet;
      const { orbitDistance } = planet;
  
      if (index === ship.planetIndex) {
        return; // No need to check collision beetween the planet where the ship is
      }
  
      const r = (size + orbitDistance + orbitDistance) / 2;
      const r2 = size / 2;
      const r3 = (size + orbitDistance) / 2;
      const im = (y - ship.y) / (x - ship.x);
      const m = -1 / im;
      const n = y - (m * x);
      const pts = findCircleLineIntersections(r, x, y, m, n);
      const pts2 = findCircleLineIntersections(r2, x, y, m, n);
      const pts3 = findCircleLineIntersections(r3, x, y, m, n);
      const y0 = m * pts[0] + n;
      const y1 = m * pts[1] + n;
      const y2 = m * pts2[0] + n;
      const y3 = m * pts2[1] + n;
      const y4 = m * pts3[0] + n;
      const y5 = m * pts3[1] + n;
      const dx = ship.x + (1000 * cos(ship.orientation));
      const dy = ship.y + (1000 * sin(ship.orientation));
  
      // SUCCES
      const isIntersectingWithRightCirclePoint = intersects(pts[0], y0, pts2[0], y2, ship.x, ship.y, dx, dy);
      const isIntersectingWithLeftCirclePoint = intersects(pts[1], y1, pts2[1], y3, ship.x, ship.y, dx, dy);
      const isIntersectingWithPlanet = intersects(pts2[0], y2, pts2[1], y3, ship.x, ship.y, dx, dy);
  
      if (isIntersectingWithRightCirclePoint || isIntersectingWithLeftCirclePoint) {
        ship.isOrbitValidated = true;
        ship.nextPlanetIndex = index;
  
        const accrochPoint = isIntersectingWithRightCirclePoint
          ? { x: pts3[0], y: y4 }
          : { x: pts3[1], y: y5 };
  
        ship.orientation = getOrbitAngle({ x: ship.x, y: ship.y }, accrochPoint);
  
        ship.accrochPoint = { planetAngle: getOrbitAngle(planet, accrochPoint), clockwise: true, point: accrochPoint };
  
        // calculate accrosh point clockwise
        if (planetOrigin.y <= planet.y) {
          ship.accrochPoint.clockwise = isIntersectingWithRightCirclePoint;
        } else {
          ship.accrochPoint.clockwise = isIntersectingWithLeftCirclePoint;
        }
      }
      ship.isDead = ship.isDead || isIntersectingWithPlanet;
    });
  
    ship.isDead = ship.isDead || !ship.isOrbitValidated;
    ship.speed = spaceSpeed;
  }
  
  static attachShipToNextPlanet() {
    if (ship.nextPlanetIndex < 0) {
      return;
    }
    const distanceBetweenShipAndNextPlanet = getDistance(ship.x, ship.y, ship.accrochPoint.point.x, ship.accrochPoint.point.y);
  
    if (distanceBetweenShipAndNextPlanet < 5) {
      ship.planetIndex = ship.nextPlanetIndex;
      ship.nextPlanetIndex = -1;
      ship.speed = orbitSpeed;
      ship.isDead = false;
      ship.isOrbitValidated = false;
      ship.planetAngle = ship.accrochPoint.planetAngle;
      ship.clockwise = ship.accrochPoint.clockwise;
    }
  }
  
  static setup() {
    createCanvas(1600, 800);
  }
  
  static draw() {
    background(220);
    drawPlanets();
    drawRays();
    moveShip();
    drawShip();
    attachShipToNextPlanet();
  }
  
  static keyPressed() {
    calculateShipTrajectory();
    ship.planetIndex = -1;
  }

}