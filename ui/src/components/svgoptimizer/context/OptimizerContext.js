import React from "react";

import { COLORS } from "../../../constants";

const OptimizerStateContext = React.createContext();
const OptimizerDispatchContext = React.createContext();

const CHANGE_OPTION = (1 << 1) | 0x100000;
const CHANGE_DATA_POINTS = (1 << 2) | 0x100000;
const RESET_OPTIONS = (1 << 3) | 0x100000;
const CHANGE_REDUCED_DATA_POINTS = (1 << 4) | 0x100000;

const defaultState = {
  options: {
    lastComputedAt: Date.now(),
    regionColors: {},
    regionOpactiy: {},
    dataPointsReductionFactor: 0,
    showDataPoints: false,
    pointsColor: COLORS[13],
    pointSize: 1,
    showBorderRegion: false,
    borderColor: COLORS[18],
    borderPadding: { left: 0, right: 0, top: 0, bottom: 0 },
    smoothWithCurve: false,
  },
  dataPoints: [],
  viewBox: { sx: 0, sy: 0, width: 10, height: 10 },
  reducedDataPoints: undefined,
};

function optimizerReducer(state = defaultState, action) {
  if (!action || !action.type) return state;

  switch (action.type) {
    case CHANGE_OPTION: {
      const { option, optionValue } = action.payload;
      return { ...state, options: { ...state.options, [option]: optionValue } };
    }
    case CHANGE_DATA_POINTS: {
      const { sx, sy, mx, my } = dimensions({ data: action.payload });
      const width = mx - sx;
      const height = my - sy;
      let newState = {
        ...state,
        dataPoints: action.payload,
        reducedDataPoints: reduceDataPoints({
          dataPoints: action.payload,
          dataPointsReductionFactor: state.options.dataPointsReductionFactor,
          width,
          height,
        }),
        viewBox: { sx, sy, width, height },
      };
      return newState;
    }
    case CHANGE_REDUCED_DATA_POINTS: {
      return { ...state, reducedDataPoints: action.payload };
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

function dimensions({ data }) {
  let sx = Number.MAX_SAFE_INTEGER,
    mx = 0,
    sy = Number.MAX_SAFE_INTEGER,
    my = 0,
    currentData;
  for (let i = data.length - 1; i >= 0; i--) {
    currentData = data[i];
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

function reduceEachRegion({ data, dataPointsReductionFactor, width, height }) {
  if (!dataPointsReductionFactor) return data;
  const xV = (width * dataPointsReductionFactor) / 100;
  const yV = (height * dataPointsReductionFactor) / 100;

  let nd = [[...data[0]]];
  let [lx, ly] = nd[0];
  for (let i = 1; i < data.length; i++) {
    if (Math.abs(lx - data[i][0]) < xV && Math.abs(ly - data[i][1]) < yV) continue;
    nd.push(data[i]);
    [lx, ly] = data[i];
  }

  return nd;
}

function reduceDataPoints({ dataPoints, dataPointsReductionFactor, width, height }) {
  let x = dataPoints.map((data) => reduceEachRegion({ data, dataPointsReductionFactor, width, height }));
  return x;
}

export {
  OptimizerContextProvider,
  useOptimizerContextState,
  useOptimizerContextDispatch,
  CHANGE_OPTION,
  RESET_OPTIONS,
  CHANGE_DATA_POINTS,
  CHANGE_REDUCED_DATA_POINTS,
  reduceDataPoints,
};
