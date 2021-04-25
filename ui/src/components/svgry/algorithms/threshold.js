export default function applyThreshold(srcImageData) {
  let v;
  let destImageData = new ImageData(srcImageData.width, srcImageData.height);

  // Applying standard threshold of 110
  for (let i = 0; i < destImageData.data.length; i += 4) {
    v = srcImageData.data[i] < 110 || srcImageData.data[i + 1] < 110 || srcImageData.data[i] < 110 ? 0 : 255;
    destImageData.data[i] = v;
    destImageData.data[i + 1] = v;
    destImageData.data[i + 2] = v;
    destImageData.data[i + 3] = srcImageData.data[i + 3];
  }

  return destImageData;
}
