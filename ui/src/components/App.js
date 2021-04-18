import React, { useState } from "react";

import IMAGES_DATA from "./../data.js";
import Optimizer from "./svgoptimizer/Optimizer.js";
import { OptimizerContextProvider } from "./svgoptimizer/context/OptimizerContext";

export default function App() {
  const [currentImage, setCurrentImage] = useState(0);

  return (
    <>
      <div>
        <span>Select Image Number : </span>
        <select onBlur={() => {}} onChange={(e) => setCurrentImage(e.target.value)}>
          {IMAGES_DATA.map((_, i) => (
            <option key={`Image:${i}`} value={`${i}`}>{`${i}`}</option>
          ))}
        </select>
      </div>
      <OptimizerContextProvider>
        <Optimizer data={IMAGES_DATA[currentImage]} />
      </OptimizerContextProvider>
    </>
  );
}
