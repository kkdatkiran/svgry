import React, { useEffect, useState } from "react";

import { COLORS } from "./../../constants";

import {
  useOptimizerContextState,
  useOptimizerContextDispatch,
  CHANGE_OPTION,
  CHANGE_REDUCED_DATA_POINTS,
} from "./context/OptimizerContext";

function computePath(data) {
  let newPaths = [];
  if (!data || !data.length) return newPaths;
  let currentData;
  for (let i = data.length - 1; i >= 0; i--) {
    currentData = data[i];
    let path = `M ${currentData[0][0]} ${currentData[0][1]} `;
    for (let j = 1; j < currentData.length; j++) {
      path += `L ${currentData[j][0]} ${currentData[j][1]} `;
    }
    newPaths.push(path + " Z");
  }
  return newPaths;
}

export default function SVGEditor() {
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
    },
    reducedDataPoints: dataPoints,
    viewBox,
  } = useOptimizerContextState();

  const [paths, setPaths] = useState([]);
  useEffect(() => {
    setPaths(computePath(dataPoints));
    dispatch({ type: CHANGE_OPTION, payload: { option: "lastComputedAt", optionValue: Date.now() } });
  }, [dataPoints]);

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
            tabIndex="0"
            onDoubleClick={(e) => {
              // let x = e.offsetX;
            }}
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
