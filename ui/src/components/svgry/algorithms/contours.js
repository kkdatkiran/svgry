export default function findContours(imgData) {
  const w = imgData.width,
    h = imgData.height;
  const totArea = w * h;
  let maskArray = new Array(w * h);
  for (let i = 0; i < maskArray.length; i++) maskArray[i] = !imgData.data[i * 4];

  let nbd = 1;
  let lnbd = 1;

  let contours = [];

  for (let i = 1; i < h - 1; i++) {
    maskArray[i * w] = 0;
    maskArray[i * w + w - 1] = 0;
  }
  for (let i = 0; i < w; i++) {
    maskArray[i] = 0;
    maskArray[w * h - 1 - i] = 0;
  }

  for (let i = 1; i < h - 1; i++) {
    lnbd = 1;

    for (let j = 1; j < w - 1; j++) {
      let i2 = 0,
        j2 = 0;
      if (maskArray[i * w + j] == 0) {
        continue;
      }
      if (maskArray[i * w + j] == 1 && maskArray[i * w + (j - 1)] == 0) {
        nbd++;
        i2 = i;
        j2 = j - 1;
      } else if (maskArray[i * w + j] >= 1 && maskArray[i * w + j + 1] == 0) {
        nbd++;
        i2 = i;
        j2 = j + 1;
        if (maskArray[i * w + j] > 1) {
          lnbd = maskArray[i * w + j];
        }
      } else {
        if (maskArray[i * w + j] != 1) {
          lnbd = Math.abs(maskArray[i * w + j]);
        }
        continue;
      }

      let B = {};
      B.points = [];
      B.points.push([j, i]);
      B.isHole = j2 == j + 1;
      B.id = nbd;
      contours.push(B);

      let B0 = {};
      for (let c = 0; c < contours.length; c++) {
        if (contours[c].id == lnbd) {
          B0 = contours[c];
          break;
        }
      }
      if (B0.isHole) {
        if (B.isHole) {
          B.parent = B0.parent;
        } else {
          B.parent = lnbd;
        }
      } else {
        if (B.isHole) {
          B.parent = lnbd;
        } else {
          B.parent = B0.parent;
        }
      }

      let icwjcw = neighbour(maskArray, w, i, j, i2, j2, 0, -1);
      if (!icwjcw) {
        maskArray[i * w + j] = -nbd;
        if (maskArray[i * w + j] != 1) {
          lnbd = Math.abs(maskArray[i * w + j]);
        }
        continue;
      }

      let [icw, jcw] = icwjcw;

      i2 = icw;
      j2 = jcw;
      let i3 = i,
        j3 = j,
        iccw,
        jccw;
      /*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
      while (true) {
        [iccw, jccw] = neighbour(maskArray, w, i3, j3, i2, j2, 1, 1);
        contours[contours.length - 1].points.push([jccw, iccw]);

        if (maskArray[i3 * w + j3 + 1] == 0) {
          maskArray[i3 * w + j3] = -nbd;
        } else if (maskArray[i3 * w + j3] == 1) {
          maskArray[i3 * w + j3] = nbd;
        }

        if (iccw == i && jccw == j && i3 == icw && j3 == jcw) {
          if (maskArray[i * w + j] != 1) {
            lnbd = Math.abs(maskArray[i * w + j]);
          }
          break;
        } else {
          i2 = i3;
          j2 = j3;
          i3 = iccw;
          j3 = jccw;
        }
      }
    }
  }
  maskArray = undefined;
  contours.forEach((e) => (e.area = computeContourArea(e.points)));
  contours = contours.sort((a, b) => a.area - b.area);
  let pointOnePercent = totArea / 1000;
  return contours.filter((e) => e.area > pointOnePercent).reverse();
}

function computeContourArea(points) {
  let a = 0;

  for (let i = 0; i < points.length - 1; i++) {
    a += points[i][0] * points[i + 1][1] - points[i + 1][0] * points[i][1];
  }
  return Math.abs(a / 2);
}

const N_ID_TO_IN = [
  (i, j) => [i, j + 1],
  (i, j) => [i - 1, j + 1],
  (i, j) => [i - 1, j],
  (i, j) => [i - 1, j - 1],
  (i, j) => [i, j - 1],
  (i, j) => [i + 1, j - 1],
  (i, j) => [i + 1, j],
  (i, j) => [i + 1, j + 1],
];
const N_IN_TO_ID = [3, 2, 1, 4, undefined, 0, 5, 6, 7];

function neighbour(maskArray, w, i0, j0, i, j, offset, clkwise = -1) {
  const id = N_IN_TO_ID[(i - i0 + 1) * 3 + (j - j0 + 1)] ?? -1;
  let nid, ni, nj;
  for (let k = 0; k < 8; k++) {
    nid = (k * clkwise + id + offset * clkwise + 8 * 2) % 8;
    [ni, nj] = N_ID_TO_IN[nid](i0, j0);
    if (maskArray[ni * w + nj] != 0) {
      return [ni, nj];
    }
  }
  return undefined;
}
