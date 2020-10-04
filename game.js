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
    speed: this.orbitSpeed,
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
    if (this.SHOW_ORBITS) {
      noFill();
      stroke(color('#000'));
      ellipse(_x, _y, _size + _orbit, _size + _orbit);
    }
  }

  static drawPlanets() {
    planets.forEach(({ x, y, size, color, orbitDistance }) => {
      this.drawPlanet(x, y, size, color, orbitDistance);
    });
  }

  static drawShip() {
    resetMatrix();
    translate(this.ship.x, this.ship.y);
    rotate(this.ship.orientation);

    fill(color(this.ship.color));
    stroke(color('#000'));
    triangle(10, 0, -5, -5, -5, 5);
  }

  static drawRays() {
    this.ship.color = 'white';
    if (this.ship.planetIndex < 0) return;
    resetMatrix();

    planets.forEach(({ x, y, size, orbitDistance }, index) => {
      if (index === this.ship.planetIndex) {
        return; // No need to draw raysfor the beetween the planet where the ship is
      }
      const r = (size + orbitDistance + orbitDistance) / 2;
      const r2 = size / 2;
      const im = (y - this.ship.y) / (x - this.ship.x);
      const m = -1 / im;
      const n = y - (m * x);
      const pts = findCircleLineIntersections(r, x, y, m, n);
      const pts2 = findCircleLineIntersections(r2, x, y, m, n);
      const y0 = m * pts[0] + n;
      const y1 = m * pts[1] + n;
      const y2 = m * pts2[0] + n;
      const y3 = m * pts2[1] + n;
      const dx = this.ship.x + (1000 * cos(this.ship.orientation));
      const dy = this.ship.y + (1000 * sin(this.ship.orientation));

      // SUCCES
      const isIntersectingWithRightCirclePoint = intersects(pts[0], y0, pts2[0], y2, this.ship.x, this.ship.y, dx, dy);
      if (isIntersectingWithRightCirclePoint) stroke(color('blue'));
      if (this.SHOW_RAYS) {
        stroke(color('#AAA'));
        line(pts[0], y0, pts2[0], y2);
      }

      const isIntersectingWithLeftCirclePoint = intersects(pts[1], y1, pts2[1], y3, this.ship.x, this.ship.y, dx, dy);
      if (isIntersectingWithLeftCirclePoint) stroke(color('#0F0'));
      if (this.SHOW_RAYS) {
        stroke(color('#AAA'));
        line(pts[1], y1, pts2[1], y3);
      }

      // MORT
      const isIntersectingWithPlanet = intersects(pts2[0], y2, pts2[1], y3, this.ship.x, this.ship.y, dx, dy);
      if (isIntersectingWithPlanet) stroke(color('#F00'));
      if (this.SHOW_RAYS) {
        stroke(color('#AAA'));
        line(pts2[0], y2, pts2[1], y3);
      }

      if (isIntersectingWithPlanet) {
        this.ship.color = 'red';
      } else if (isIntersectingWithRightCirclePoint || isIntersectingWithLeftCirclePoint) {
        this.ship.color = 'green';
      } else {
        this.ship.color = 'white';
      }
    });

    resetMatrix();
    stroke(color(this.ship.color));
    translate(this.ship.x, this.ship.y);
    rotate(this.ship.orientation);
    line(0, 0, 2000, 0);
  }

  static moveShipInSpace() {
    const o = this.ship.orientation;
    const dr = this.ship.speed;
    const dx = dr * cos(o);
    const dy = dr * sin(o);
    this.ship.x += dx;
    this.ship.y += dy;
  }

  static moveShipInOrbit() {
    const planet = planets[this.ship.planetIndex];
    const { x, y, size, orbitDistance } = planet;
    const o = this.ship.planetAngle;
    const dr = (size + orbitDistance) / 2;
    const dx = dr * cos(o);
    const dy = dr * sin(o);
    this.ship.x = x + dx;
    this.ship.y = y + dy;
    const angularVelocity = (2 * this.ship.speed) / (Math.PI * dr);
    this.ship.planetAngle += this.ship.clockwise ? angularVelocity : -angularVelocity;
    this.ship.orientation = this.ship.planetAngle + (this.ship.clockwise ? (Math.PI / 2) : -(Math.PI / 2));
  }

  static moveShip() {
    if (this.ship.planetIndex < 0) {
      this.moveShipInSpace();
    } else {
      this.moveShipInOrbit();
    }
  }

  static calculateShipTrajectory() {
    const planetOrigin = planets[this.ship.planetIndex];

    // Nose ray
    resetMatrix();
    stroke(color('#000'));
    translate(this.ship.x, this.ship.y);
    rotate(this.ship.orientation);
    line(0, 0, 2000, 0);

    resetMatrix();
    stroke(color('#AAA'));
    this.ship.isOrbitValidated = false;
    this.ship.isDead = false;
    resetMatrix();

    planets.forEach((planet, index) => {
      const { x } = planet;
      const { y } = planet;
      const { size } = planet;
      const { orbitDistance } = planet;

      if (index === this.ship.planetIndex) {
        return; // No need to check collision beetween the planet where the ship is
      }

      const r = (size + orbitDistance + orbitDistance) / 2;
      const r2 = size / 2;
      const r3 = (size + orbitDistance) / 2;
      const im = (y - this.ship.y) / (x - this.ship.x);
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
      const dx = this.ship.x + (1000 * cos(this.ship.orientation));
      const dy = this.ship.y + (1000 * sin(this.ship.orientation));

      // SUCCES
      const isIntersectingWithRightCirclePoint = intersects(pts[0], y0, pts2[0], y2, this.ship.x, this.ship.y, dx, dy);
      const isIntersectingWithLeftCirclePoint = intersects(pts[1], y1, pts2[1], y3, this.ship.x, this.ship.y, dx, dy);
      const isIntersectingWithPlanet = intersects(pts2[0], y2, pts2[1], y3, this.ship.x, this.ship.y, dx, dy);

      if (isIntersectingWithRightCirclePoint || isIntersectingWithLeftCirclePoint) {
        this.ship.isOrbitValidated = true;
        this.ship.nextPlanetIndex = index;

        const accrochPoint = isIntersectingWithRightCirclePoint
          ? { x: pts3[0], y: y4 }
          : { x: pts3[1], y: y5 };

        this.ship.orientation = getOrbitAngle({ x: this.ship.x, y: this.ship.y }, accrochPoint);

        this.ship.accrochPoint = { planetAngle: getOrbitAngle(planet, accrochPoint), clockwise: true, point: accrochPoint };

        // calculate accrosh point clockwise
        if (planetOrigin.y <= planet.y) {
          this.ship.accrochPoint.clockwise = isIntersectingWithRightCirclePoint;
        } else {
          this.ship.accrochPoint.clockwise = isIntersectingWithLeftCirclePoint;
        }
      }
      this.ship.isDead = this.ship.isDead || isIntersectingWithPlanet;
    });

    this.ship.isDead = this.ship.isDead || !this.ship.isOrbitValidated;
    this.ship.speed = this.spaceSpeed;
  }

  static attachShipToNextPlanet() {
    if (this.ship.nextPlanetIndex < 0) {
      return;
    }
    const distanceBetweenShipAndNextPlanet = getDistance(this.ship.x, this.ship.y, this.ship.accrochPoint.point.x, this.ship.accrochPoint.point.y);

    if (distanceBetweenShipAndNextPlanet < 5) {
      this.ship.planetIndex = this.ship.nextPlanetIndex;
      this.ship.nextPlanetIndex = -1;
      this.ship.speed = this.orbitSpeed;
      this.ship.isDead = false;
      this.ship.isOrbitValidated = false;
      this.ship.planetAngle = this.ship.accrochPoint.planetAngle;
      this.ship.clockwise = this.ship.accrochPoint.clockwise;
    }
  }

  static setup() {
    createCanvas(1600, 800);
  }

  static draw() {
    background(220);
    this.drawPlanets();
    this.drawRays();
    this.moveShip();
    this.drawShip();
    this.attachShipToNextPlanet();
  }

  static keyPressed() {
    this.calculateShipTrajectory();
    this.ship.planetIndex = -1;
  }
}

window.setup = Game.setup;
window.draw = Game.draw;
window.keyPressed = Game.keyPressed;
window.preload = Game.preload;
window.touchStarted = Game.touchStarted;
