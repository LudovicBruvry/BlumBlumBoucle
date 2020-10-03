/* eslint-disable object-curly-newline */
const SHOW_ORBITS = true;
const SHOW_RAYS = true;

const planets = [
  { x: 300, y: 400, size: 80, color: '#F0F', orbitDistance: 50 },
  { x: 600, y: 700, size: 60, color: '#0FF', orbitDistance: 50 },
  /*
  { x: 600, y: 200, size: 60, color: '#0FF', orbitDistance: 50 },
  { x: 200, y: 100, size: 15, color: '#FF0', orbitDistance: 50 },
  { x: 200, y: 700, size: 15, color: '#FF0', orbitDistance: 50 },
  */
];

const orbitSpeed = 1;
const spaceSpeed = 8;
const ship = {
  x: 400,
  y: 400,
  speed: orbitSpeed,
  orientation: 0,
  planetAngle: -Math.PI ,
  planetIndex: 0,
  clockwise: true,
  isDead: false,
  isOrbitValidated: false,
  nextPlanetIndex: -1,
  accrochPoint: { planetAngle: 0, clockwise: true },
  color: 'white'
};
const lineOfTheShip = {
  destination : {x:0, y:0},
  size : 10,
  visible: false
}

function setup() {
  createCanvas(800, 800);
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

function findCircleLineIntersections(r, h, k, m, n) {
  // circle: (x - h)^2 + (y - k)^2 = r^2
  // line: y = m * x + n
  // r: circle radius
  // h: x value of circle centre
  // k: y value of circle centre
  // m: slope
  // n: y-intercept

  // get a, b, c values
  const a = 1 + sq(m);
  const b = -h * 2 + (m * (n - k)) * 2;
  const c = sq(h) + sq(n - k) - sq(r);

  // get discriminant
  const d = sq(b) - 4 * a * c;
  if (d >= 0) {
    // insert into quadratic formula
    const intersections = [
      (-b + sqrt(sq(b) - 4 * a * c)) / (2 * a),
      (-b - sqrt(sq(b) - 4 * a * c)) / (2 * a),
    ];
    if (d === 0) {
      // only 1 intersection
      return [intersections[0]];
    }
    return intersections;
  }
  // no intersection
  return [];
}

function intersects(a, b, c, d, p, q, r, s) {
  const det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  }
  const lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
  const gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
  return (lambda > 0 && lambda < 1) && (gamma > 0 && gamma < 1);
}

function drawRays() {
  ship.color = 'white';
  /*if(ship.planetIndex < 0)
  {
    return;
  }*/
  resetMatrix();

  planets.forEach(({ x, y, size, orbitDistance }, index) => {

    if (index == ship.planetIndex) {
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
    var isIntersectingWithRightCirclePoint = intersects(pts[0], y0, pts2[0], y2, ship.x, ship.y, dx, dy);
    if (isIntersectingWithRightCirclePoint) stroke(color('blue'));
    if (SHOW_RAYS) {
      stroke(color('#AAA'));
      line(pts[0], y0, pts2[0], y2);
    }

    var isIntersectingWithLeftCirclePoint = intersects(pts[1], y1, pts2[1], y3, ship.x, ship.y, dx, dy)
    if (isIntersectingWithLeftCirclePoint) stroke(color('#0F0'));
    if (SHOW_RAYS) {
      stroke(color('#AAA'));
      line(pts[1], y1, pts2[1], y3);
    }

    // MORT
    var isIntersectingWithPlanet = intersects(pts2[0], y2, pts2[1], y3, ship.x, ship.y, dx, dy);
    if (isIntersectingWithPlanet) stroke(color('#F00'));
    if (SHOW_RAYS) {
      stroke(color('#AAA'));
      line(pts2[0], y2, pts2[1], y3);
    }

    ship.color =
      isIntersectingWithPlanet ? 'red'
        : isIntersectingWithRightCirclePoint || isIntersectingWithLeftCirclePoint ? 'green'
          : 'white';
  });
  
  resetMatrix();
  stroke(color(ship.color));
  translate(ship.x, ship.y);
  rotate(ship.orientation);
  line(0, 0, 2000, 0);
}

function moveShipInSpace() {
  const o = ship.orientation;
  const dr = ship.speed;
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

function draw() {
  background(220);
  drawPlanets();
  drawRays();
  moveShip();
  drawShip();
  attachShipToNextPlanet();
}

function keyPressed() {
  calculateShipTrajectory();
  ship.planetIndex = -1;
}

function calculateShipTrajectory() {
  var planetOrigin = planets[ship.planetIndex];

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
    var x = planet.x;
    var y = planet.y;
    var size = planet.size;
    var orbitDistance = planet.orbitDistance;

    if (index == ship.planetIndex) {
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
    var isIntersectingWithRightCirclePoint = intersects(pts[0], y0, pts2[0], y2, ship.x, ship.y, dx, dy);
    var isIntersectingWithLeftCirclePoint = intersects(pts[1], y1, pts2[1], y3, ship.x, ship.y, dx, dy)
    var isIntersectingWithPlanet = intersects(pts2[0], y2, pts2[1], y3, ship.x, ship.y, dx, dy);

    if (isIntersectingWithRightCirclePoint || isIntersectingWithLeftCirclePoint) {
      ship.isOrbitValidated = true;
      ship.nextPlanetIndex = index;

      var accrochPoint = isIntersectingWithRightCirclePoint
        ? { x: pts3[0], y: y4 }
        : { x: pts3[1], y: y5 };

      ship.orientation = getOrbitAngle({ x: ship.x, y: ship.y }, accrochPoint);

      ship.accrochPoint = { planetAngle: getOrbitAngle(planet, accrochPoint), clockwise: true, point: accrochPoint };

      // calculate accrosh point clockwise
      if (planetOrigin.y <= planet.y)  //  O=origin, D=destination                // O                O
      {                                                                          // D< clockwise↷   >D !clockwise↶
        ship.accrochPoint.clockwise = isIntersectingWithRightCirclePoint;
      } else {
        ship.accrochPoint.clockwise = isIntersectingWithLeftCirclePoint;         // D< !clockwise↶   >D clockwise↷
      }                                                                          // O                 O

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
  var distanceBetweenShipAndNextPlanet = getDistance(ship.x, ship.y, ship.accrochPoint.point.x, ship.accrochPoint.point.y);

  if (distanceBetweenShipAndNextPlanet < 5) {
    ship.planetIndex = ship.nextPlanetIndex;
    ship.nextPlanetIndex = -1;
    ship.speed = orbitSpeed;
    ship.isDead = false;
    ship.isOrbitValidated = false;
    ship.planetAngle = ship.accrochPoint.planetAngle;
    ship.clockwise = ship.accrochPoint.clockwise;
  };
}

function getOrbitAngle(planet, point) {
  return atan2(point.y - planet.y, point.x - planet.x);
}

function getDistance(xA, yA, xB, yB) {
  var xDiff = xA - xB;
  var yDiff = yA - yB;

  return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}

function getMediumPoint(p1, p2) {
  var xDist = p2.x - p1.x;
  var yDist = p2.y - p1.y;
  var dist = Math.sqrt(xDist * xDist + yDist * yDist);

  var fractionOfTotal = getDistance(p1.x, p1.y, p2.x, p2.y) / dist;

  var result = {
    x: p1.x + xDist * fractionOfTotal,
    y: p1.y + yDist * fractionOfTotal
  }
  return result;
}
