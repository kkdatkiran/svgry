import React from "react";

export default function Header({ showApp, onNavClick }) {
  return (
    <div className="Header">
      <a href="#banner" onClick={() => onNavClick(false)}>
        <div className="logo"></div>
      </a>
      <div className="menu">
        <nav>
          <a href="#about" onClick={() => onNavClick(false)}>
            About
          </a>
          <a href="#app" className={`${showApp ? "selected" : ""}`} onClick={() => onNavClick(true)}>
            App
          </a>
          <a rel="noreferrer" target="_blank" href="https://github.com/kkdatkiran/svgry">
            Github
          </a>
          <a rel="noreferrer" target="_blank" href="https://github.com/kkdatkiran/svgry/blob/main/LICENSE">
            License
          </a>
          <a href="#use" onClick={() => onNavClick(false)}>
            Use
          </a>
        </nav>
      </div>
    </div>
  );
}
