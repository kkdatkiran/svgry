import React from "react";

import { COLORS } from "../../../constants";

const OptimizerStateContext = React.createContext();
const OptimizerDispatchContext = React.createContext();

const CHANGE_OPTION = (1 << 1) | 0x100000;
const CHANGE_ORIGINAL_REGIONS = (1 << 2) | 0x100000;
const RESET_OPTIONS = (1 << 3) | 0x100000;
const CHANGE_REDUCED_DATA_POINTS = (1 << 4) | 0x100000;

const defaultState = {
  options: {
    lastComputedAt: Date.now(),
    regionColors: {},
    regionBorderSize: 0,
    regionOpactiy: {},
    dataPointsReductionFactor: 0,
    dataPointsAverageFactor: 0,
    showDataPoints: false,
    pointsColor: COLORS[13],
    pointSize: 1,
    showBorderRegion: false,
    borderColor: COLORS[18],
    borderPadding: { left: 0, right: 0, top: 0, bottom: 0 },
    smoothWithCurve: false,
  },
  originalRegions: [],
  regions: [],
  viewBox: { sx: 0, sy: 0, width: 10, height: 10 },
};

function optimizerReducer(state = defaultState, action) {
  if (!action || !action.type) return state;

  switch (action.type) {
    case CHANGE_OPTION: {
      const { option, optionValue } = action.payload;
      return { ...state, options: { ...state.options, [option]: optionValue } };
    }
    case CHANGE_ORIGINAL_REGIONS: {
      const { sx, sy, mx, my } = dimensions(action.payload);
      const width = mx - sx;
      const height = my - sy;
      let newState = {
        ...state,
        regions: action.payload,
        originalRegions: JSON.parse(JSON.stringify(action.payload)),
        viewBox: { sx, sy, width, height },
        options: { ...state.options, lastComputedAt: Date.now() },
      };
      return newState;
    }
    case CHANGE_REDUCED_DATA_POINTS: {
      return { ...state, regions: action.payload };
    }
    case RESET_OPTIONS: {
      return { ...state, options: { ...defaultState.options } };
    }
    default:
      return state;
  }
}

function OptimizerContextProvider({ children, defaultService }) {
  let firstState = { ...defaultState };
  if (defaultService) {
    firstState.serviceFunctions = { content: [defaultService] };
    firstState.selected = 0;
  }
  const [state, dispatch] = React.useReducer(optimizerReducer, firstState);

  return (
    <OptimizerStateContext.Provider value={state}>
      <OptimizerDispatchContext.Provider value={dispatch}>{children}</OptimizerDispatchContext.Provider>
    </OptimizerStateContext.Provider>
  );
}

function useOptimizerContextState() {
  const ctx = React.useContext(OptimizerStateContext);
  if (!ctx)
    throw new Error("Unable create context for optimizer context. Please use in components wrapped in OptimizerContextProvider.");
  return ctx;
}

function useOptimizerContextDispatch() {
  const ctx = React.useContext(OptimizerDispatchContext);
  if (!ctx)
    throw new Error("Unable create context for optimizer context. Please use in components wrapped in OptimizerContextProvider.");
  return ctx;
}

function dimensions(regions) {
  let sx = Number.MAX_SAFE_INTEGER,
    mx = 0,
    sy = Number.MAX_SAFE_INTEGER,
    my = 0,
    currentData;
  for (let i = regions.length - 1; i >= 0; i--) {
    currentData = regions[i].points;
    sx = sx > currentData[0][0] ? currentData[0][0] : sx;
    mx = mx < currentData[0][0] ? currentData[0][0] : mx;
    sy = sy > currentData[0][1] ? currentData[0][1] : sy;
    my = my < currentData[0][1] ? currentData[0][1] : my;
    for (let j = 1; j < currentData.length; j++) {
      sx = sx > currentData[j][0] ? currentData[j][0] : sx;
      mx = mx < currentData[j][0] ? currentData[j][0] : mx;
      sy = sy > currentData[j][1] ? currentData[j][1] : sy;
      my = my < currentData[j][1] ? currentData[j][1] : my;
    }
  }

  return { sx, sy, mx, my };
}

export {
  OptimizerContextProvider,
  useOptimizerContextState,
  useOptimizerContextDispatch,
  CHANGE_OPTION,
  RESET_OPTIONS,
  CHANGE_ORIGINAL_REGIONS,
  CHANGE_REDUCED_DATA_POINTS,
};
