import React, { useState } from "react";

import { useOptimizerContextDispatch, useOptimizerContextState, CHANGE_OPTION } from "../../../context/OptimizerContext";

export default function Padding() {
  const [adjustCommonPadding, setAdjustCommonPadding] = useState(false);

  const dispatch = useOptimizerContextDispatch();
  const {
    options: { borderPadding },
    viewBox,
  } = useOptimizerContextState();

  const { left: pLeft, right: pRight, top: pTop, bottom: pBottom } = borderPadding;
  const setBorderPadding = (optionValue) => dispatch({ type: CHANGE_OPTION, payload: { option: "borderPadding", optionValue } });
  return (
    <>
      <div className="sectionTitle">
        Padding :
        <input type="checkbox" checked={adjustCommonPadding} onChange={() => setAdjustCommonPadding(!adjustCommonPadding)} />
      </div>
      <div className="section">
        <div className="field sliderField">
          <label htmlFor="paddingLeft" className="label">
            Left ({pLeft}):
          </label>
          <input
            name="paddingLeft"
            type="range"
            min={0}
            max={viewBox.width}
            value={pLeft}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (adjustCommonPadding) setBorderPadding({ left: value, right: value, top: value, bottom: value });
              else setBorderPadding({ ...borderPadding, left: value });
            }}
          />
        </div>
        <div className="field sliderField">
          <label htmlFor="paddingRight" className="label">
            Right ({pRight}):
          </label>
          <input
            name="paddingRight"
            type="range"
            min={0}
            max={viewBox.width}
            value={pRight}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (adjustCommonPadding) setBorderPadding({ left: value, right: value, top: value, bottom: value });
              else setBorderPadding({ ...borderPadding, right: value });
            }}
          />
        </div>

        <div className="field sliderField">
          <label htmlFor="paddingTop" className="label">
            Top ({pTop}):
          </label>
          <input
            name="paddingTop"
            type="range"
            min={0}
            max={viewBox.height}
            value={pTop}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (adjustCommonPadding) setBorderPadding({ left: value, right: value, top: value, bottom: value });
              else setBorderPadding({ ...borderPadding, top: value });
            }}
          />
        </div>
        <div className="field sliderField">
          <label htmlFor="paddingBottom" className="label">
            Bottom ({pBottom}):
          </label>
          <input
            name="paddingBottom"
            type="range"
            min={0}
            max={viewBox.height}
            value={pBottom}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (adjustCommonPadding) setBorderPadding({ left: value, right: value, top: value, bottom: value });
              else setBorderPadding({ ...borderPadding, bottom: value });
            }}
          />
        </div>
      </div>
    </>
  );
}
