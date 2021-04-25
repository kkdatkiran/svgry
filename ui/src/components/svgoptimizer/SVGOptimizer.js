import React, { useEffect, useState } from "react";

import { COLORS } from "../../constants";

import {
  useOptimizerContextState,
  useOptimizerContextDispatch,
  CHANGE_OPTION,
  CHANGE_REDUCED_DATA_POINTS,
} from "./context/OptimizerContext";

function computePath(data, smoothWithCurve) {
  let newPaths = [];
  if (!data || !data.length) return newPaths;
  let currentData;
  for (let i = data.length - 1; i >= 0; i--) {
    currentData = smoothWithCurve ? curveControlPoints(data[i]) : data[i];
    let path = `M ${currentData[0][0]} ${currentData[0][1]} `;
    for (let j = 1; j < currentData.length; j++) {
      if (smoothWithCurve) {
        path += `C ${currentData[j - 1][2]} ${currentData[j - 1][3]} ${currentData[j - 1][4]} ${currentData[j - 1][5]} ${
          currentData[j][0]
        } ${currentData[j][1]} `;
      } else {
        path += `L ${currentData[j][0]} ${currentData[j][1]} `;
      }
    }
    newPaths.push(path + " Z");
  }
  return newPaths;
}

function curveControlPoints(points) {
  points = JSON.parse(JSON.stringify(points));
  points.push([...points[0]]);
  points.push([...points[0]]);

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

export default function SVGOptimizer({ regions, onChange }) {
  const dispatch = useOptimizerContextDispatch();
  const {
    options: {
      showDataPoints,
      showBorderRegion,
      borderPadding,
      lastComputedAt,
      regionColors,
      regionOpactiy,
      pointsColor,
      borderColor,
      pointSize,
      smoothWithCurve,
    },
    reducedDataPoints: dataPoints,
    viewBox,
  } = useOptimizerContextState();

  const [paths, setPaths] = useState([]);
  useEffect(() => {
    setPaths(computePath(dataPoints, smoothWithCurve));
    dispatch({ type: CHANGE_OPTION, payload: { option: "lastComputedAt", optionValue: Date.now() } });
  }, [regions, smoothWithCurve]);

  const { left: pLeft, right: pRight, top: pTop, bottom: pBottom } = borderPadding;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${viewBox.width + pLeft + pRight} ${viewBox.height + pTop + pBottom}`}>
      <g transform={`translate(${-viewBox.sx + pLeft} ${-viewBox.sy + pTop})`}>
        {paths.map((d, i) => (
          <path
            key={`${lastComputedAt}-path-${i}`}
            d={d}
            fill={regionColors[i] ?? COLORS[i % COLORS.length]}
            fillOpacity={regionOpactiy[i] ?? 1}
          ></path>
        ))}
        {showDataPoints &&
          dataPoints.flatMap((r, ui) =>
            r.map(([x, y], i) => (
              <circle
                key={`${lastComputedAt}-point-${ui}-${i}`}
                cx={x}
                cy={y}
                r={(Math.sqrt((viewBox.width * viewBox.height) / 10000) / 2) * pointSize}
                fill={pointsColor}
                tabIndex="0"
                onDoubleClick={() => {
                  const nDP = [...dataPoints];
                  nDP[ui] = [...nDP[ui]];
                  nDP[ui].splice(i, 1);
                  dispatch({ type: CHANGE_REDUCED_DATA_POINTS, payload: nDP });
                }}
              />
            ))
          )}
        {showBorderRegion && (
          <rect
            x={viewBox.sx - pLeft}
            y={viewBox.sy - pTop}
            width={viewBox.width + pLeft + pRight}
            height={viewBox.height + pTop + pBottom}
            fill="none"
            stroke={borderColor}
            strokeWidth="3"
          />
        )}
      </g>
    </svg>
  );
}
