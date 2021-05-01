export default function reduceDataPoints({
  regions,
  dataPointsReductionFactor,
  dataPointsAverageFactor,
  smoothWithCurve,
  width,
  height,
}) {
  let x = JSON.parse(JSON.stringify(regions)).map((data) => {
    if (dataPointsAverageFactor !== 0) data.points = averageOut(data.points, dataPointsAverageFactor);
    data.points = reduceEachRegion(data.points, dataPointsReductionFactor, width, height);
    if (smoothWithCurve) data.points = curveControlPoints(data.points);
    return data;
  });
  return x;
}

function averageOut(points, dataPointsAverageFactor) {
  if (points.length <= dataPointsAverageFactor + 1 || dataPointsAverageFactor < 3) return points;
  let np = [],
    x,
    y,
    j;
  let factor = Math.round((dataPointsAverageFactor * points.length) / 1000);
  for (let i = 0; i < points.length; i++) {
    x = y = 0;
    for (j = i; j < i + factor && j < points.length; j++) {
      x += points[j][0];
      y += points[j][1];
    }
    if (j !== i) np.push([x / (j - i), y / (j - i)]);
    i = j - 1;
  }
  // console.log(dataPointsAverageFactor, points, np);
  return np;
}

function reduceEachRegion(data, dataPointsReductionFactor, width, height) {
  if (!dataPointsReductionFactor) return data;
  const xV = (width * dataPointsReductionFactor) / 100;
  const yV = (height * dataPointsReductionFactor) / 100;

  let nd = [[...data[0]]];
  let [lx, ly] = nd[0];
  for (let i = 1; i < data.length; i++) {
    if (Math.abs(lx - data[i][0]) < xV && Math.abs(ly - data[i][1]) < yV) continue;
    nd.push(data[i]);
    [lx, ly] = data[i];
  }

  return nd;
}

function curveControlPoints(points) {
  if (!points || points.length < 2) return points;

  points.push(points[0]);

  let n = points.length - 1;
  let a = [[0, 0]],
    b = [[2, 2]],
    c = [[1, 1]],
    r = [[points[0][0] + 2 * points[1][0], points[0][1] + 2 * points[1][1]]];

  //0  x, 1  y
  for (let i = 1; i < n - 1; i++) {
    a[i] = [1, 1];
    b[i] = [4, 4];
    c[i] = [1, 1];
    r[i] = [4 * points[i][0] + 2 * points[i + 1][0], 4 * points[i][1] + 2 * points[i + 1][1]];
  }
  a[n - 1] = [2, 2];
  b[n - 1] = [7, 7];
  c[n - 1] = [0, 0];
  r[n - 1] = [8 * points[n - 1][0] + points[n][0], 8 * points[n - 1][1] + points[n][1]];

  let m;
  for (let i = 1; i < n; i++) {
    m = (a[i][0] / b[i - 1][0]) * 1;
    b[i][0] = b[i][0] - m * c[i - 1][0];
    r[i][0] = r[i][0] - m * r[i - 1][0];

    m = (a[i][1] / b[i - 1][1]) * 1;
    b[i][1] = b[i][1] - m * c[i - 1][1];
    r[i][1] = r[i][1] - m * r[i - 1][1];
  }

  points[n - 1][2] = r[n - 1][0] / b[n - 1][0];
  points[n - 1][3] = r[n - 1][1] / b[n - 1][1];
  for (let i = n - 2; i >= 0; --i) {
    points[i][2] = ((r[i][0] - c[i][0] * points[i + 1][2]) / b[i][0]) * 1;
    points[i][3] = ((r[i][1] - c[i][1] * points[i + 1][3]) / b[i][1]) * 1;
  }

  for (let i = 0; i < n - 1; i++) {
    points[i][4] = 2 * points[i + 1][0] - points[i + 1][2];
    points[i][5] = 2 * points[i + 1][1] - points[i + 1][3];
  }

  points[n - 1][4] = 0.5 * (points[n][0] + points[n - 1][2]);
  points[n - 1][5] = 0.5 * (points[n][1] + points[n - 1][3]);

  points.splice(points.length - 1, 1);

  return points;
}
