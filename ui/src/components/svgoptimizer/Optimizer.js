import React, { useState, useEffect } from "react";

const COLORS = [
  "#845ec2",
  "#d65db1",
  "#ff6f91",
  "#ff9671",
  "#ffc75f",
  "#f9f871",
  "#2c73d2",
  "#0081cf",
  "#0089ba",
  "#008e9b",
  "#008f7a",
  "#b39cd0",
  "#fbeaff",
  "#00c9a7",
  "#c4fcef",
  "#4d8076",
  "#4b4453",
  "#b0a8b9",
  "#c34a36",
  "#ff8066",
  "#4e8397",
  "#d5cabd",
  "#f3c5ff",
  "#fefedf",
  "#d3ecf7",
  "#1d87a4",
  "#4ffbdf",
  "#00c2a8",
  "#008b74",
  "#9b89b3",
  "#fef6ff",
  "#00896f",
  "#00c0a3",
  "#936c00",
  "#008ac2",
  "#bea6a0",
  "#009efa",
  "#00d2fc",
  "#b15b00",
  "#008e83",
  "#c493ff",
  "#296073",
  "#3596b5",
  "#adc5cf",
  "#fcf8ff",
  "#b93daf",
  "#d83121",
  "#c197ff",
  "#005b44",
  "#a178df",
  "#be93fd",
  "#dcb0ff",
  "#faccff",
  "#d8acff",
  "#41227f",
  "#f0c2ff",
  "#a57ce4",
];

function reduceDataPoints({ data, dataPointsReductionFactor, width, height }) {
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

function computePath({ data, dataPointsReductionFactor, width, height }) {
  let newPaths = [];
  let newData = [];
  let currentData;
  for (let i = data.length - 1; i >= 0; i--) {
    currentData = reduceDataPoints({ data: data[i], dataPointsReductionFactor, width, height });
    let path = `M ${currentData[0][0]} ${currentData[0][1]} `;
    for (let j = 1; j < currentData.length; j++) {
      path += `L ${currentData[j][0]} ${currentData[j][1]} `;
    }
    newPaths.push(path + " Z");
    newData.push(currentData);
  }
  return { pathStrings: newPaths, data: newData };
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

export default function Optimizer({ data = [] }) {
  const [paths, setPaths] = useState([]);
  const [viewBox, setViewBox] = useState({ sx: 0, sy: 0, width: 10, height: 10 });
  const [lastComputedAt, setLastComputedAt] = useState(Date.now());
  const [regionColors, setRegionColors] = useState({});
  const [regionOpactiy, setRegionOpacity] = useState({});
  const [dataPointsReductionFactor, setDataPointsReductionFactor] = useState(0);
  const [showDataPoints, setShowDataPoints] = useState(false);
  const [showBorderRegion, setShowBorderRegion] = useState(false);
  const [reducedDataPoints, setReducedDataPoints] = useState([]);
  const [borderPadding, setBorderPadding] = useState({ left: 0, right: 0, top: 0, bottom: 0 });
  const [adjustCommonPadding, setAdjustCommonPadding] = useState(false);

  useEffect(() => {
    const { sx, sy, mx, my } = dimensions({ data });
    const width = mx - sx;
    const height = my - sy;
    const { pathStrings, data: newData } = computePath({ data, dataPointsReductionFactor, width, height });
    setPaths(pathStrings);
    setReducedDataPoints(newData);
    setViewBox({ sx, sy, width, height });
    setLastComputedAt(Date.now());
  }, [data, dataPointsReductionFactor]);

  const { left: pLeft, right: pRight, top: pTop, bottom: pBottom } = borderPadding;
  return (
    <div className="optimizer">
      <div className="svgContainer">
        <svg width="100%" height="100%" viewBox={`0 0 ${viewBox.width + pLeft + pRight} ${viewBox.height + pTop + pBottom}`}>
          <g transform={`translate(${-viewBox.sx + pLeft} ${-viewBox.sy + pTop})`}>
            {paths.map((d, i) => (
              <path
                key={`${lastComputedAt}-path-${i}`}
                d={d}
                fill={regionColors[i] ?? COLORS[i % COLORS.length]}
                fillOpacity={regionOpactiy[i] ?? 1}
              ></path>
            ))}
            {showDataPoints &&
              reducedDataPoints.flatMap((r, ui) =>
                r.map(([x, y], i) => (
                  <circle
                    key={`${lastComputedAt}-point-${ui}-${i}`}
                    cx={x}
                    cy={y}
                    r={Math.sqrt((viewBox.width * viewBox.height) / 10000) / 2}
                    fill={COLORS[13]}
                    stroke={COLORS[16]}
                    strokeWidth="1"
                    fillOpacity="0.8"
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
                stroke={COLORS[16]}
                strokeWidth="3"
              />
            )}
          </g>
        </svg>
      </div>
      <div className="controlContainer">
        <div className="sectionTitle">Region Colors :</div>
        <div className="section">
          {paths.map((_, i) => (
            <>
              <div key={`${lastComputedAt}-color-${i}`} className="field colorField">
                <label className="label">Region {`${i}`}:</label>
                <input
                  type="color"
                  value={regionColors[i] ?? COLORS[i % COLORS.length]}
                  onChange={(e) => setRegionColors({ ...regionColors, [i]: e.target.value })}
                />
              </div>
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
                  onChange={(e) => setRegionOpacity({ ...regionOpactiy, [i]: e.target.value })}
                />
              </div>
            </>
          ))}
        </div>
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
              onChange={(e) => setDataPointsReductionFactor(e.target.value)}
            />
          </div>
        </div>
        <div className="sectionTitle">Points :</div>
        <div className="section">
          <div className="field booleanField">
            <label htmlFor="showPoint" className="label">
              Show :
            </label>
            <input name="showPoint" type="checkbox" value={showDataPoints} onChange={() => setShowDataPoints(!showDataPoints)} />
          </div>
          <div className="field booleanField">
            <label htmlFor="showBorder" className="label">
              Border :
            </label>
            <input
              name="showBorder"
              type="checkbox"
              value={showBorderRegion}
              onChange={() => setShowBorderRegion(!showBorderRegion)}
            />
          </div>
        </div>
        <div className="sectionTitle">
          Padding :
          <input type="checkbox" value={adjustCommonPadding} onChange={() => setAdjustCommonPadding(!adjustCommonPadding)} />
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
      </div>
    </div>
  );
}
