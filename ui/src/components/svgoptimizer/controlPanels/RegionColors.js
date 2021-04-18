import React from "react";

import { COLORS } from "./../../../constants";
import { useOptimizerContextDispatch, useOptimizerContextState, CHANGE_OPTION } from "./../context/OptimizerContext";

export default function RegionColors() {
  const dispatch = useOptimizerContextDispatch();
  const {
    dataPoints,
    options: { lastComputedAt, regionColors, regionOpactiy },
  } = useOptimizerContextState();

  return (
    <>
      <div className="sectionTitle">Region Colors :</div>
      <div className="section">
        {dataPoints.flatMap((_, i) => [
          <div key={`${lastComputedAt}-color-${i}`} className="field colorField">
            <label className="label">Region {`${i}`}:</label>
            <input
              type="color"
              value={regionColors[i] ?? COLORS[i % COLORS.length]}
              onChange={(e) =>
                dispatch({
                  type: CHANGE_OPTION,
                  payload: { option: "regionColors", optionValue: { ...regionColors, [i]: e.target.value } },
                })
              }
            />
          </div>,
          <div key={`${lastComputedAt}-opacity-${i}`} className="field colorField sliderField">
            <label htmlFor="regionOpacity" className="label">
              Opacity :
            </label>
            <input
              name="regionOpacity"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={regionOpactiy[i] ?? 1}
              onChange={(e) =>
                dispatch({
                  type: CHANGE_OPTION,
                  payload: { option: "regionOpactiy", optionValue: { ...regionOpactiy, [i]: e.target.value } },
                })
              }
            />
          </div>,
        ])}
      </div>
    </>
  );
}
