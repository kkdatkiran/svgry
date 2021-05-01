import React from "react";

import { COLORS } from "../../../../../constants";
import { useOptimizerContextDispatch, useOptimizerContextState, CHANGE_OPTION } from "../../../context/OptimizerContext";

export default function RegionColors() {
  const dispatch = useOptimizerContextDispatch();
  const {
    regions,
    options: { lastComputedAt, regionColors, regionOpactiy, regionBorderSize },
  } = useOptimizerContextState();

  return (
    <>
      <div className="sectionTitle">Region Colors :</div>
      <div className="section">
        {regions
          .filter((e) => !e.isHole)
          .flatMap(({ id: i }, index) => [
            <div key={`${lastComputedAt}-color-${i}`} className="field colorField">
              <label className="label">Region {`${index + 1}`}:</label>
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
      <div className="sectionTitle">Region Borders :</div>
      <div className="section">
        <div className="field sliderField">
          <label htmlFor="regionBorderSize" className="label">
            Border Size :
          </label>
          <input
            name="regionBorderSize"
            type="range"
            min={0}
            max={100}
            step={1}
            value={regionBorderSize}
            onChange={(e) =>
              dispatch({
                type: CHANGE_OPTION,
                payload: { option: "regionBorderSize", optionValue: e.target.value },
              })
            }
          />
        </div>
      </div>
    </>
  );
}
