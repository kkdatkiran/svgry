import React, { useState, useEffect, useRef } from "react";
import applyThreshold from "../algorithms/threshold";
import findContours from "../algorithms/contours";
import { COLORS } from "../../../constants";

function onCropHandlDragStart(e, which, { croppers, setDragInfo }) {
  const { left, top } = croppers[which];
  setDragInfo({ which, delta: { left: e.nativeEvent.offsetX, top: e.nativeEvent.offsetY }, start: { left, top } });
}

function drawOnCanvas({ canvasRef, image, croppers, fillStyle = "#fff8", regions }) {
  if (!canvasRef.current || !image) return;

  const ctx = canvasRef.current.getContext("2d");
  ctx.drawImage(image, 0, 0);

  // Drawing crop Area,
  ctx.fillStyle = fillStyle;
  let path = new Path2D();
  path.moveTo(croppers.tl.left, 0);
  path.lineTo(croppers.tl.left, croppers.tl.top);
  path.lineTo(croppers.tr.left, croppers.tr.top);
  path.lineTo(croppers.br.left, croppers.br.top);
  path.lineTo(croppers.bl.left, croppers.bl.top);
  path.lineTo(croppers.tl.left, croppers.tl.top);
  path.lineTo(0, croppers.tl.top);
  path.lineTo(0, image.height);
  path.lineTo(image.width, image.height);
  path.lineTo(image.width, 0);
  path.lineTo(croppers.tl.left, 0);
  ctx.fill(path);
  path = new Path2D();
  path.moveTo(0, 0);
  path.lineTo(croppers.tl.left, 0);
  path.lineTo(croppers.tl.left, croppers.tl.top);
  path.lineTo(0, croppers.tl.top);
  path.lineTo(0, 0);
  ctx.fill(path);

  if (!regions || !regions.length) return;

  ctx.fillStyle = "";
  ctx.lineWidth = 4;
  for (let i = 0; i < regions.length; i++) {
    if (!regions[i].points || !regions[i].points.length) continue;
    ctx.strokeStyle = COLORS[i];
    ctx.beginPath();
    ctx.moveTo(regions[i].points[0][0], regions[i].points[0][1]);
    for (let j = 1; j < regions[i].points.length; j++) {
      ctx.lineTo(regions[i].points[j][0], regions[i].points[j][1]);
    }
    ctx.stroke();
  }
}

function findRegions({ canvasRef, image, croppers }) {
  if (!canvasRef.current || !image) return;

  // Removing the cropped area
  drawOnCanvas({ canvasRef, image, croppers, fillStyle: "#fff" });
  const ctx = canvasRef.current.getContext("2d");
  let thImgData = applyThreshold(ctx.getImageData(0, 0, image.width, image.height));
  const contours = findContours(thImgData);
  thImgData = null;
  return contours;
}

const CROP_HANDLER_OFFSET = {
  tl: { left: 0, top: 0 },
  tr: { left: 20, top: 10 },
  bl: { left: 0, top: 20 },
  br: { left: 20, top: 20 },
};

export default function PictureScreen({ image, onSetLoading, onChange }) {
  const canvasRef = useRef();
  const [croppers, setCroppers] = useState({
    tl: { left: 0, top: 0 },
    tr: { left: 0, top: 0 },
    bl: { left: 0, top: 0 },
    br: { left: 0, top: 0 },
  });
  const [dragInfo, setDragInfo] = useState();
  const [regions, setRegions] = useState();

  useEffect(() => {
    if (!canvasRef.current || !image) return;
    canvasRef.current.width = image.width;
    canvasRef.current.height = image.height;
    canvasRef.current.style.width = image.width;
    canvasRef.current.style.height = image.height;
    setCroppers({
      tl: { left: 0, top: 0 },
      tr: { left: image.width, top: 0 },
      bl: { left: 0, top: image.height },
      br: { left: image.width, top: image.height },
    });
  }, [image, canvasRef.current]);

  useEffect(() => {
    drawOnCanvas({ canvasRef, image, croppers, regions });
  }, [croppers, regions]);

  const { tl, tr, bl, br } = croppers;

  return (
    <div className="pictureScreen">
      <div
        className="canvasContainer"
        role="button"
        tabIndex="0"
        onMouseMove={(e) => {
          if (!dragInfo) return;
          const { left, top } = e.currentTarget.getBoundingClientRect();
          const { which, delta } = dragInfo;
          const finalLeft = e.clientX + e.currentTarget.scrollLeft - left - delta.left + CROP_HANDLER_OFFSET[which].left;
          const finalTop = e.clientY + e.currentTarget.scrollTop - top - delta.top + CROP_HANDLER_OFFSET[which].top;
          if (finalLeft < 0 || finalLeft > image.width || finalTop < 0 || finalTop > image.height) return;
          setCroppers({
            ...croppers,
            [which]: {
              left: finalLeft,
              top: finalTop,
            },
          });
        }}
        onMouseUp={() => setDragInfo(undefined)}
        onMouseLeave={() => setDragInfo(undefined)}
      >
        <canvas ref={canvasRef} />
        <div
          className="cropHandle tl"
          style={tl}
          role="button"
          tabIndex="0"
          onMouseDown={(e) => onCropHandlDragStart(e, "tl", { croppers, setDragInfo })}
        />
        <div
          className="cropHandle tr"
          style={tr}
          role="button"
          tabIndex="0"
          onMouseDown={(e) => onCropHandlDragStart(e, "tr", { croppers, setDragInfo })}
        />
        <div
          className="cropHandle bl"
          style={bl}
          role="button"
          tabIndex="0"
          onMouseDown={(e) => onCropHandlDragStart(e, "bl", { croppers, setDragInfo })}
        />
        <div
          className="cropHandle br"
          style={br}
          role="button"
          tabIndex="0"
          onMouseDown={(e) => onCropHandlDragStart(e, "br", { croppers, setDragInfo })}
        />
      </div>
      <div className="picutreSteps">
        <button
          className={`${!regions ? "selected" : ""}`}
          onClick={() => {
            onSetLoading(true);
            setTimeout(() => {
              setRegions(findRegions({ canvasRef, image, croppers }));
              onSetLoading(false);
            }, 1000);
          }}
        >
          Find Regions
        </button>
        {regions && (
          <button className="selected" onClick={() => onChange(regions)}>
            Finetune Regions
          </button>
        )}
      </div>
    </div>
  );
}
