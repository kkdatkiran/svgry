import React, { useState } from "react";
import SVGOptimizer from "../svgoptimizer/SVGOptimizer";

import FirstScreen from "./components/FirstScreen";
import PictureScreen from "./components/PictureScreen";
import { START_SCREEN, PICTURE_SCREEN, PICTURE_EDIT_SCREEN, LOADING_SCREEN } from "./constants";

export function SVGry() {
  const [screenNumber, setScreenNumber] = useState(START_SCREEN);
  const [image, setImage] = useState();
  const [regions, setRegions] = useState();

  let screenChoice = undefined;
  let loader = undefined;

  if ((screenNumber & START_SCREEN) === START_SCREEN) {
    screenChoice = (
      <FirstScreen
        onChange={setScreenNumber}
        onStartReadingFile={(f) => {
          let img = new Image();
          img.src = URL.createObjectURL(f);
          img.onload = function () {
            setTimeout(() => {
              setImage(img);
              setScreenNumber(PICTURE_SCREEN);
            }, 1000);
          };
        }}
      />
    );
  } else if ((screenNumber & PICTURE_SCREEN) === PICTURE_SCREEN) {
    screenChoice = (
      <PictureScreen
        image={image}
        onChange={(rs) => {
          if (!rs || !rs.length) return;
          setRegions(rs);
          setScreenNumber(PICTURE_EDIT_SCREEN);
        }}
        onSetLoading={(x) => setScreenNumber(x ? PICTURE_SCREEN | LOADING_SCREEN : PICTURE_SCREEN)}
      />
    );
  } else if ((screenNumber & PICTURE_EDIT_SCREEN) === PICTURE_EDIT_SCREEN) {
    screenChoice = <SVGOptimizer regions={regions} onChange={setScreenNumber} />;
  }
  if ((screenNumber & LOADING_SCREEN) === LOADING_SCREEN) loader = <div className="loader" />;

  return (
    <div id="app" className="slide">
      {screenChoice}
      {loader}
    </div>
  );
}
