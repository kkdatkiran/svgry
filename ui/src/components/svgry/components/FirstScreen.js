import React from "react";

import { PICTURE_SCREEN, EDIT_SCREEN, LOADING_SCREEN } from "../constants";

export default function FirstScreen({ onChange, onStartReadingFile }) {
  return (
    <div className="firstScreen">
      <div className="option">
        <div className="optionIcon">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (!e.target.files || !e.target.files[0]) return;
              onChange(PICTURE_SCREEN | LOADING_SCREEN);
              onStartReadingFile(e.target.files[0]);
            }}
          />
        </div>
        <div className="optionName">Upload or drop or Take a Picture</div>
      </div>
      <div className="optionDivider" />

      <div className="option">
        <div
          className="optionIcon"
          role="button"
          tabIndex="0"
          onClick={() => onChange(EDIT_SCREEN)}
          onKeyPress={(e) => (e.code === "Enter" || e.code === "Space") && onChange(EDIT_SCREEN)}
        ></div>
        <div className="optionName">Create New</div>
      </div>
    </div>
  );
}
