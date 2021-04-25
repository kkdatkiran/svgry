import React, { useEffect } from "react";

import {
  useOptimizerContextDispatch,
  useOptimizerContextState,
  reduceDataPoints,
  CHANGE_OPTION,
  CHANGE_REDUCED_DATA_POINTS,
} from "./../context/OptimizerContext";

export default function Smooth() {
  const dispatch = useOptimizerContextDispatch();
  const {
    options: { dataPointsReductionFactor, smoothWithCurve },
    dataPoints,
    viewBox: { width, height },
  } = useOptimizerContextState();

  useEffect(() => {
    dispatch({
      type: CHANGE_REDUCED_DATA_POINTS,
      payload: reduceDataPoints({ dataPoints, dataPointsReductionFactor, width, height }),
    });
  }, [dataPointsReductionFactor]);

  return (
    <>
      <div className="sectionTitle">Smooth :</div>
      <div className="section">
        <div className="field sliderField">
          <label htmlFor="dataPointsReductionFactor" className="label">
            Reduce points :
          </label>
          <input
            name="dataPointsReductionFactor"
            type="range"
            min={0}
            max={15}
            step={0.01}
            value={dataPointsReductionFactor}
            onChange={(e) =>
              dispatch({
                type: CHANGE_OPTION,
                payload: { option: "dataPointsReductionFactor", optionValue: e.target.value },
              })
            }
          />
        </div>
        <div className="field booleanField">
          <label htmlFor="smoothWithCurve" className="label">
            Curve :
          </label>
          <input
            name="showPoint"
            type="checkbox"
            checked={smoothWithCurve}
            onChange={() =>
              dispatch({
                type: CHANGE_OPTION,
                payload: { option: "smoothWithCurve", optionValue: !smoothWithCurve },
              })
            }
          />
        </div>
      </div>
    </>
  );
}
