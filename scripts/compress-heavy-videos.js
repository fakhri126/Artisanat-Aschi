const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const execFileAsync = promisify(execFile);

const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpegPath = ffmpegInstaller?.path;

if (!ffmpegPath || !fs.existsSync(ffmpegPath)) {
  console.error('FFmpeg introuvable.');
  process.exit(1);
}

const DIRS = [
  path.join(process.cwd(), 'public', 'uploads'),
  path.join(process.cwd(), 'public'),
];

async function compressFile(filePath) {
  const stat = fs.statSync(filePath);
  const sizeMb = stat.size / (1024 * 1024);
  
  // Compresser uniquement si > 3 Mo
  if (sizeMb < 3.0) {
    return;
  }

  const ext = path.extname(filePath);
  if (ext.toLowerCase() !== '.mp4') return;

  const tempOutput = `${filePath}.temp_opt.mp4`;
  console.log(`\n▶ Compression de : ${path.basename(filePath)} (${sizeMb.toFixed(2)} Mo)`);

  const ffmpegArgs = [
    '-i', filePath,
    '-vf', "scale='min(1280,iw)':-2",
    '-c:v', 'libx264',
    '-crf', '28',
    '-preset', 'fast',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-movflags', '+faststart',
    tempOutput,
    '-y'
  ];

  try {
    await execFileAsync(ffmpegPath, ffmpegArgs);
    if (fs.existsSync(tempOutput)) {
      const newStat = fs.statSync(tempOutput);
      const newMb = newStat.size / (1024 * 1024);
      const savedPercent = Math.round((1 - newStat.size / stat.size) * 100);

      // Seulement si le nouveau fichier est plus petit et valide
      if (newStat.size > 0 && newStat.size < stat.size) {
        fs.unlinkSync(filePath);
        fs.renameSync(tempOutput, filePath);
        console.log(`  ✅ Succès : ${newMb.toFixed(2)} Mo (-${savedPercent}% de bande passante !)`);
      } else {
        fs.unlinkSync(tempOutput);
        console.log(`  ℹ Fichier original conservé.`);
      }
    }
  } catch (err) {
    console.error(`  ❌ Erreur compression sur ${path.basename(filePath)}:`, err.message);
    if (fs.existsSync(tempOutput)) {
      try { fs.unlinkSync(tempOutput); } catch (_) {}
    }
  }
}

async function run() {
  console.log('=== DÉBUT DE LA COMPRESSION DES VIDÉOS LOURDES ===');
  for (const dir of DIRS) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const fullPath = path.join(dir, f);
      if (fs.statSync(fullPath).isFile() && f.toLowerCase().endsWith('.mp4')) {
        await compressFile(fullPath);
      }
    }
  }
  console.log('\n=== COMPRESSION TERMINÉE AVEC SUCCÈS ===');
}

run().catch(console.error);
