import React, { useEffect } from "react";

import { useOptimizerContextDispatch, CHANGE_DATA_POINTS, RESET_OPTIONS } from "./context/OptimizerContext";
import Padding from "./controlPanels/Padding";
import Points from "./controlPanels/Points";
import RegionColors from "./controlPanels/RegionColors";
import Smooth from "./controlPanels/Smooth";
import SVGOptimizer from "./SVGOptimizer";

export default function Optimizer({ data = [] }) {
  const dispatch = useOptimizerContextDispatch();

  useEffect(() => {
    dispatch({ type: CHANGE_DATA_POINTS, payload: data });
    dispatch({ type: RESET_OPTIONS });
  }, [data]);

  return (
    <div className="optimizer">
      <div className="svgContainer">
        <SVGOptimizer />
      </div>
      <div className="controlContainer">
        <RegionColors />
        <Smooth />
        <Points />
        <Padding />
      </div>
    </div>
  );
}
