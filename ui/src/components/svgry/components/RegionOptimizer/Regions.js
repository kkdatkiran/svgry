import React from "react";

import { COLORS } from "../../../../constants";

import {
  useOptimizerContextState,
  useOptimizerContextDispatch,
  CHANGE_REDUCED_DATA_POINTS,
} from "../../context/OptimizerContext";

function findrange(nums, sx, mx, sy, my) {
  for (let i = 0; i < nums.length; i++) {
    if (i & (1 === 1)) {
      if (sy > nums[i]) sy = nums[i];
      else if (my < nums[i]) my = nums[i];
    } else {
      if (sx > nums[i]) sx = nums[i];
      else if (mx < nums[i]) mx = nums[i];
    }
  }

  return [sx, mx, sy, my];
}

function makePaths({ regions, regionColors, regionOpactiy, lastComputedAt, regionBorderSize }) {
  if (!regions || !regions.length) return;

  let currentData, pathd;

  let masks = {};
  let minsMaxes = {};
  let paths = [];
  let holeBorders = [];
  let mx, my, sx, sy;

  regions
    .sort((a, b) => b.id - a.id)
    .forEach((e) => {
      if (!e.points || !e.points.length) return;
      currentData = e.points;
      pathd = `M ${currentData[0][0]} ${currentData[0][1]} `;
      mx = sx = currentData[0][0];
      my = sy = currentData[0][1];
      for (let j = 1; j < currentData.length; j++) {
        [sx, mx, sy, my] = findrange(currentData[j], sx, mx, sy, my);
        if (currentData[j - 1].length > 2) {
          pathd += `C ${currentData[j - 1][2]} ${currentData[j - 1][3]} ${currentData[j - 1][4]} ${currentData[j - 1][5]} ${
            currentData[j][0]
          } ${currentData[j][1]} `;
        } else {
          pathd += `L ${currentData[j][0]} ${currentData[j][1]} `;
        }
      }
      if (e.isHole) {
        if (!masks[e.parent]) masks[e.parent] = [];
        masks[e.parent].push(<path key={`${lastComputedAt}-mask-${e.id}`} d={pathd + "Z"} fill="black" />);
        if (regionBorderSize) {
          holeBorders.push(
            <path
              key={`${lastComputedAt}-path-${e.id}`}
              d={pathd + "Z"}
              strokeWidth={regionBorderSize}
              stroke="black"
              fill="none"
            />
          );
        }
      } else {
        minsMaxes[e.id] = [sx, mx, sy, my];
        paths.push(
          <path
            key={`${lastComputedAt}-path-${e.id}`}
            d={pathd + "Z"}
            fill={regionColors[e.id] ?? COLORS[e.id % COLORS.length]}
            fillOpacity={regionOpactiy[e.id] ?? 1}
            strokeWidth={regionBorderSize}
            stroke="black"
            mask={`url(#mask${e.id})`}
          />
        );
      }
    });
  return [
    Object.entries(masks).map(([k, masks]) => {
      [sx, mx, sy, my] = minsMaxes[k];
      return (
        <mask key={`${lastComputedAt}-mask-${k}`} id={`mask${k}`}>
          <rect key={`${lastComputedAt}-maskrect-${k}`} x={sx} y={sy} width={mx - sx} height={my - sy} fill="white" />
          {masks}
        </mask>
      );
    }),
    ...paths,
    ...holeBorders,
  ];
}

export default function Regions() {
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
      regionBorderSize,
    },
    regions,
    viewBox,
  } = useOptimizerContextState();

  const { left: pLeft, right: pRight, top: pTop, bottom: pBottom } = borderPadding;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${viewBox.width + pLeft + pRight} ${viewBox.height + pTop + pBottom}`}>
      <g transform={`translate(${-viewBox.sx + pLeft} ${-viewBox.sy + pTop})`}>
        {makePaths({ regions, regionColors, regionOpactiy, lastComputedAt, regionBorderSize })}
        {showDataPoints &&
          regions.flatMap((r, ui) =>
            r.points?.map(([x, y], i) => (
              <circle
                key={`${lastComputedAt}-point-${ui}-${i}`}
                cx={x}
                cy={y}
                r={(Math.sqrt((viewBox.width * viewBox.height) / 10000) / 2) * pointSize}
                fill={pointsColor}
                tabIndex="0"
                onDoubleClick={() => {
                  const nRegions = JSON.parse(JSON.stringify(regions));
                  nRegions[ui].points.splice(i, 1);
                  dispatch({ type: CHANGE_REDUCED_DATA_POINTS, payload: nRegions });
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
