/* eslint-disable object-curly-newline */
const SHOW_ORBITS = true;
const SHOW_RAYS = true;

const planets = [
  { x: 300, y: 400, size: 120, color: '#F0F', orbitDistance: 50 },
  { x: 600, y: 200, size: 60, color: '#0FF', orbitDistance: 50 },
  { x: 200, y: 100, size: 15, color: '#FF0', orbitDistance: 50 },
];

const ship = {
  x: 400,
  y: 400,
  speed: 0.5,
  orientation: 0,
  planetAngle: Math.PI,
  planetIndex: 2,
  clockwise: true,
};

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
  fill(color('#FFF'));
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
  if (!SHOW_RAYS) return;
  // Nose ray
  resetMatrix();
  stroke(color('#000'));
  translate(ship.x, ship.y);
  rotate(ship.orientation);
  line(0, 0, 2000, 0);

  resetMatrix();
  stroke(color('#AAA'));
  planets.forEach(({ x, y, size, orbitDistance }) => {
    stroke(color('#AAA'));
    line(ship.x, ship.y, x, y);
    const r = (size + orbitDistance + orbitDistance) / 2;
    const im = (y - ship.y) / (x - ship.x);
    const m = -1 / im;
    const n = y - (m * x);
    const pts = findCircleLineIntersections(r, x, y, m, n);
    const y0 = m * pts[0] + n;
    const y1 = m * pts[1] + n;
    const dx = ship.x + (1000 * cos(ship.orientation));
    const dy = ship.y + (1000 * sin(ship.orientation));  

    if (intersects(x, y, pts[0], y0, ship.x, ship.y, dx, dy)) {
      stroke(color('#F00'));
    } else {
      stroke(color('#AAA'));
    }
    line(x, y, pts[0], y0);
    if (intersects(x, y, pts[1], y1, ship.x, ship.y, dx, dy)) {
      stroke(color('#F00'));
    } else {
      stroke(color('#AAA'));
    }
    line(x, y, pts[1], y1);
  });
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
  if (ship.planetIndex === null) {
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
}

function keyPressed() {
  ship.planetIndex = null;
  if (keyCode === LEFT_ARROW) {
    ship.orientation += (Math.PI / 90);
  } else if (keyCode === RIGHT_ARROW) {
    ship.orientation -= (Math.PI / 90);
  }
}
