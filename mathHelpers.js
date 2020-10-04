function getDistance(xA, yA, xB, yB) {
  const xDiff = xA - xB;
  const yDiff = yA - yB;

  return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}

function isPointInLine(point, line) {
  return (
      ((point.x >= line.a.x && point.x <= line.b.x)
      && (point.y >= line.a.y && point.y <= line.b.y))
      ||
      ((point.x >= line.b.x && point.x <= line.a.x)
      && (point.y >= line.b.y && point.y <= line.a.y))
  );
}

function findCircleLinePointsIntersections(r, x, y, pointA, pointB) {
  const m = (pointA.y - pointB.y) / (pointA.x - pointB.x);
  const n = pointA.y - (m * pointA.x);
  let result = findCircleLineIntersections(r, x, y, m, n);
  result = result.filter(point => isPointInLine(point, { a: pointA, b: pointB }));
  return result;
}

function getSlope(line) {
  const m = (line.a.y - line.b.y) / (line.a.x - line.b.x);
  const n = line.a.y - (m * line.a.x);
  return { m, n }
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
    const x1 = (-b + sqrt(sq(b) - 4 * a * c)) / (2 * a);
    const x2 = (-b - sqrt(sq(b) - 4 * a * c)) / (2 * a);
    const intersections = [
      { x: x1, y: m * x1 + n },
      { x: x2, y: m * x2 + n },
    ];
    if (d === 0) return [intersections[0]];
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

function getPerpendicularAtRayon(line, point, rayon) {
  const im = (line.a.y - line.b.y) / (line.a.x - line.b.x);
  const m = -1 / im;
  const n = line.a.y - (m * line.a.x);

  return findCircleLineIntersections(rayon, point.x, point.y, m, n);
}

function findLinesIntersection(point1, point2, point3, point4) {
  const ua = ((point4.x - point3.x) * (point1.y - point3.y)
    - (point4.y - point3.y) * (point1.x - point3.x))
    / ((point4.y - point3.y) * (point2.x - point1.x)
      - (point4.x - point3.x) * (point2.y - point1.y));

  const x = point1.x + ua * (point2.x - point1.x);
  const y = point1.y + ua * (point2.y - point1.y);

  return { x, y };
}


function getArrayMin(array, getValue) {
  let minimum = Infinity;
  let result = null;

  array.forEach((element) => {
    const value = getValue(element);
    if (value < minimum) {
      minimum = value;
      result = element;
    }
  });
  return result;
}

function splitPointsIntoLines(points) {
  const result = [];
  let lastPoint = points[0];
  // eslint-disable-next-line no-plusplus
  for (let index = 1; index < points.length; index++) {
    result.push({ a: lastPoint, b: points[index] });
    lastPoint = points[index];
  }

  return result;
}

function getMediumPoint(pointA, pointB) {
  return {
    x: (pointA.x + pointB.x) / 2,
    y: (pointA.y + pointB.y) / 2,
  };
}

function IsSameLine(line1, line2, peech) {
  return line1.a.x - line2.a.x < peech
    && line1.a.y - line2.a.y < peech
    && line1.b.x - line2.b.x < peech
    && line1.b.y - line2.b.y < peech;
}

function getCorrectLineBetween2Lines(line1, line2, initialSens, isUpDownOrEqual) {
  let sens = initialSens; // 1->up, 0->isOk, -1->down
  let lineUp = line1;
  let lineDown = line2;
  let lineMedium = initialSens === 1 ? lineDown : lineUp;
  var lineLimit = initialSens === 1 ? lineUp : lineDown;

  do {
    if (sens === 1) lineDown = lineMedium; // Move Up
    else if (sens === -1) lineUp = lineMedium; // Move down

    lineMedium = {
      a: getMediumPoint(lineUp.a, lineDown.a),
      b: getMediumPoint(lineUp.b, lineDown.b),
    };
    sens = isUpDownOrEqual(lineMedium);
  }
  while (sens !== 0 || IsSameLine(lineLimit, lineMedium, 2));

  return lineMedium;
}

export { getDistance, getPerpendicularAtRayon, findCircleLineIntersections, intersects, getOrbitAngle, findCircleLinePointsIntersections, findLinesIntersection, getArrayMin, splitPointsIntoLines, getMediumPoint, getCorrectLineBetween2Lines };
