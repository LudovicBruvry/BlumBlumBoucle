function getDistance(xA, yA, xB, yB) {
  const xDiff = xA - xB;
  const yDiff = yA - yB;

  return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
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

function getOrbitAngle(planet, point) {
  return atan2(point.y - planet.y, point.x - planet.x);
}

export { getDistance, findCircleLineIntersections, intersects, getOrbitAngle };
