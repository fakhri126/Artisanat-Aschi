import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputImagePath = 'C:/Users/kaddo/.gemini/antigravity/brain/3266ba77-64bf-441e-b239-9425c63eda89/.user_uploaded/media_1786880419347.jpg';
const artifactDir = 'C:/Users/kaddo/.gemini/antigravity/brain/3266ba77-64bf-441e-b239-9425c63eda89/knobs_extracted';

async function extractPureKnobs() {
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const image = sharp(inputImagePath);
  const metadata = await image.metadata();
  const W = metadata.width || 1024;
  const H = metadata.height || 1024;

  console.log(`Traitement haute résolution de l'image source : ${W}x${H}`);

  const COLS = 7;
  const ROWS = 8;

  // Exact coordinates for the 8x7 grid
  const leftX = W * 0.153;
  const rightX = W * 0.847;
  const topY = H * 0.153;
  const bottomY = H * 0.852;

  const stepX = (rightX - leftX) / (COLS - 1);
  const stepY = (bottomY - topY) / (ROWS - 1);

  const knobDiameter = Math.round(W * 0.089);
  const cropSize = Math.round(knobDiameter * 1.25);
  const targetSize = 400;

  // Ultra-crisp subpixel circular mask with smooth anti-aliased edge
  const maskSvg = Buffer.from(`
    <svg width="${targetSize}" height="${targetSize}">
      <circle cx="${targetSize / 2}" cy="${targetSize / 2}" r="${targetSize / 2 - 2}" fill="white" />
    </svg>
  `);

  let count = 0;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      count++;
      const numStr = String(count).padStart(2, '0');

      let cx = Math.round(leftX + c * stepX);
      let cy = Math.round(topY + r * stepY);

      // Adjust for knob 52 (Row 8, Col 3) which is slightly larger
      let currentCropSize = cropSize;
      if (r === 7 && c === 2) {
        currentCropSize = Math.round(cropSize * 1.15);
      }

      const left = Math.max(0, Math.round(cx - currentCropSize / 2));
      const top = Math.max(0, Math.round(cy - currentCropSize / 2));
      const width = Math.min(W - left, currentCropSize);
      const height = Math.min(H - top, currentCropSize);

      try {
        // Extract isolated knob directly with transparent background
        const pureKnobBuffer = await sharp(inputImagePath)
          .extract({ left, top, width, height })
          .resize(targetSize, targetSize, { 
            fit: 'cover',
            kernel: sharp.kernel.lanczos3 
          })
          .composite([{ input: maskSvg, blend: 'dest-in' }])
          .png({ compressionLevel: 9, quality: 100 })
          .toBuffer();

        // 1. Save pure isolated transparent PNG (NO wood background)
        const pngPath = path.join(artifactDir, `knob_${numStr}.png`);
        fs.writeFileSync(pngPath, pureKnobBuffer);

        // 2. Also save crisp isolated JPG on neutral clean studio background
        const jpgPath = path.join(artifactDir, `knob_${numStr}.jpg`);
        await sharp({
          create: {
            width: targetSize,
            height: targetSize,
            channels: 4,
            background: { r: 248, g: 245, b: 240, alpha: 1 } // clean neutral ivory/studio
          }
        })
          .composite([{ input: pureKnobBuffer, top: 0, left: 0 }])
          .jpeg({ quality: 98 })
          .toFile(jpgPath);

        console.log(`[${numStr}/56] Poignée ${numStr} extraite sans fond.`);
      } catch (err) {
        console.error(`Erreur poignée ${count}:`, err);
      }
    }
  }

  console.log(`\nSuccès : 56 poignées isolées sans fond de bois générées !`);
}

extractPureKnobs().catch(console.error);
