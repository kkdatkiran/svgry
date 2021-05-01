import React, { useEffect } from "react";

import {
  useOptimizerContextDispatch,
  useOptimizerContextState,
  CHANGE_ORIGINAL_REGIONS,
  RESET_OPTIONS,
} from "../../context/OptimizerContext";
import Points from "./controlPanels/Points";
import RegionColors from "./controlPanels/RegionColors";
import Smooth from "./controlPanels/Smooth";
import Regions from "./Regions";

export default function RegionOptimizer({ regions = [], onChange }) {
  const dispatch = useOptimizerContextDispatch();
  const { regions: finalRegions } = useOptimizerContextState();

  useEffect(() => {
    dispatch({ type: CHANGE_ORIGINAL_REGIONS, payload: regions });
    dispatch({ type: RESET_OPTIONS });
  }, [regions]);

  return (
    <div className="optimizer">
      <div className="svgContainer">
        <Regions />
      </div>
      <div className="controlContainer">
        <RegionColors />
        <Smooth />
        <Points />
        <div className="optimizerButtons">
          <button onClick={() => onChange(finalRegions)} className="regions">
            Move to Editor
          </button>
        </div>
      </div>
    </div>
  );
}
