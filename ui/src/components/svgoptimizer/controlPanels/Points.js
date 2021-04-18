import React from "react";

import { useOptimizerContextDispatch, useOptimizerContextState, CHANGE_OPTION } from "./../context/OptimizerContext";

export default function Points() {
  const dispatch = useOptimizerContextDispatch();
  const {
    options: { showDataPoints, pointsColor, pointSize, showBorderRegion, borderColor },
  } = useOptimizerContextState();

  return (
    <>
      <div className="sectionTitle">Points :</div>
      <div className="section">
        <div className="field booleanField">
          <label htmlFor="showPoint" className="label">
            Show :
          </label>
          <input
            name="showPoint"
            type="checkbox"
            checked={showDataPoints}
            onChange={() =>
              dispatch({
                type: CHANGE_OPTION,
                payload: { option: "showDataPoints", optionValue: !showDataPoints },
              })
            }
          />
        </div>
        <div className="field colorField">
          <label htmlFor="pointsColor" className="label">
            Point :
          </label>
          <input
            type="color"
            value={pointsColor}
            onChange={(e) =>
              dispatch({
                type: CHANGE_OPTION,
                payload: { option: "pointsColor", optionValue: e.target.value },
              })
            }
          />
        </div>
        <div className="field sliderField">
          <label htmlFor="pointSize" className="label">
            Point size :
          </label>
          <input
            name="pointSize"
            type="range"
            min={0}
            max={10}
            step={0.1}
            value={pointSize}
            onChange={(e) =>
              dispatch({
                type: CHANGE_OPTION,
                payload: { option: "pointSize", optionValue: e.target.value },
              })
            }
          />
        </div>
      </div>

      <div className="sectionTitle">Border :</div>
      <div className="section">
        <div className="field booleanField">
          <label htmlFor="showBorder" className="label">
            Show :
          </label>
          <input
            name="showBorder"
            type="checkbox"
            checked={showBorderRegion}
            onChange={() =>
              dispatch({
                type: CHANGE_OPTION,
                payload: { option: "showBorderRegion", optionValue: !showBorderRegion },
              })
            }
          />
        </div>
        <div className="field colorField">
          <label htmlFor="borderColor" className="label">
            Border :
          </label>
          <input
            type="color"
            value={borderColor}
            onChange={(e) =>
              dispatch({
                type: CHANGE_OPTION,
                payload: { option: "borderColor", optionValue: e.target.value },
              })
            }
          />
        </div>
      </div>
    </>
  );
}
