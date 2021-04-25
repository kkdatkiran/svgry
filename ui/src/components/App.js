import React, { useState, useEffect } from "react";

import { OptimizerContextProvider } from "./svgoptimizer/context/OptimizerContext";
import Header from "./site/Header.js";
import Banner from "./site/Banner.js";
import About from "./site/About.js";
import Use from "./site/Use.js";
import { SVGry } from "./svgry/SVGry.js";
import Footer from "./site/Footer.js";

export default function App() {
  const [showApp, setShowApp] = useState();
  useEffect(() => {
    setShowApp(window.location.href.indexOf("#app") !== -1);
  }, []);
  let stack;
  if (!showApp)
    stack = (
      <>
        <Banner />
        <About />
        <Use />
      </>
    );
  else stack = <SVGry />;
  return (
    <OptimizerContextProvider>
      <Header showApp={showApp} onNavClick={setShowApp} />
      {stack}
      <Footer />
    </OptimizerContextProvider>
  );
}
