const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function checkMagicBytes(buffer, ext) {
  ext = ext.toLowerCase();
  if (buffer.length < 4) return { valid: false, detected: 'too_short' };

  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { valid: ['.jpg', '.jpeg'].includes(ext), detected: 'image/jpeg' };
  }
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return { valid: ext === '.png', detected: 'image/png' };
  }
  // GIF: GIF87a or GIF89a
  if (buffer.subarray(0, 3).toString('ascii') === 'GIF') {
    return { valid: ext === '.gif', detected: 'image/gif' };
  }
  // WebP: RIFF .... WEBP
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') {
    return { valid: ext === '.webp', detected: 'image/webp' };
  }
  // MP4 / QuickTime: 'ftyp' at offset 4
  if (buffer.length >= 8 && buffer.subarray(4, 8).toString('ascii') === 'ftyp') {
    return { valid: ['.mp4', '.mov'].includes(ext), detected: 'video/mp4' };
  }
  // WebM / Matroska: 1A 45 DF A3
  if (buffer[0] === 0x1A && buffer[1] === 0x45 && buffer[2] === 0xDF && buffer[3] === 0xA3) {
    return { valid: ext === '.webm', detected: 'video/webm' };
  }

  return { valid: false, detected: 'unknown' };
}

function audit() {
  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
  const colorsFile = path.join(__dirname, '..', 'public', 'colors-data.json');
  const reelFile = path.join(__dirname, '..', 'public', 'reel-data.json');

  console.log('=== AUDIT DES COULEURS ===');
  const colors = JSON.parse(fs.readFileSync(colorsFile, 'utf8'));
  console.log(`Nombre de couleurs: ${colors.length}`);
  colors.forEach((c, i) => console.log(`  [${i+1}] id=${c.id}, label="${c.label}", hex=${c.hex}, isDefault=${c.isDefault}`));

  console.log('\n=== AUDIT DU REEL ===');
  const reel = JSON.parse(fs.readFileSync(reelFile, 'utf8'));
  console.log(`Vidéo URL: ${reel.videoUrl}`);
  console.log(`Nombre d'avis (reviews): ${reel.reviews.length}`);
  reel.reviews.forEach((r, i) => console.log(`  [${i+1}] id=${r.id}, platform=${r.platform}, name="${r.name}", rating=${r.rating}, time=${r.time}s, duration=${r.duration}s, position=${r.position}`));

  console.log('\n=== AUDIT DE PUBLIC/UPLOADS ===');
  if (!fs.existsSync(uploadsDir)) {
    console.log('Dossier public/uploads introuvable !');
    return;
  }

  const entries = fs.readdirSync(uploadsDir, { withFileTypes: true });
  const subdirs = entries.filter(e => e.isDirectory()).map(e => e.name);
  const files = entries.filter(e => e.isFile()).map(e => e.name);

  console.log(`Sous-dossiers trouvés: ${subdirs.length > 0 ? subdirs.join(', ') : 'Aucun (répertoire plat)'}`);
  console.log(`Total fichiers trouvés: ${files.length}`);

  let totalBytes = 0;
  const extCounts = {};
  const mimeCounts = {};
  const hashToFiles = {};
  const invalidFiles = [];

  for (const fileName of files) {
    const fullPath = path.join(uploadsDir, fileName);
    const stats = fs.statSync(fullPath);
    totalBytes += stats.size;

    const ext = path.extname(fileName).toLowerCase();
    extCounts[ext] = (extCounts[ext] || 0) + 1;

    const buffer = Buffer.alloc(Math.min(stats.size, 64));
    const fd = fs.openSync(fullPath, 'r');
    fs.readSync(fd, buffer, 0, buffer.length, 0);
    fs.closeSync(fd);

    const magic = checkMagicBytes(buffer, ext);
    mimeCounts[magic.detected] = (mimeCounts[magic.detected] || 0) + 1;

    if (!magic.valid) {
      invalidFiles.push({ fileName, ext, detected: magic.detected, size: stats.size });
    }

    // SHA-256 complet
    const fileBuffer = fs.readFileSync(fullPath);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    if (!hashToFiles[hash]) {
      hashToFiles[hash] = [];
    }
    hashToFiles[hash].push({ fileName, size: stats.size });
  }

  console.log(`Taille totale: ${totalBytes} octets (${(totalBytes / (1024 * 1024)).toFixed(2)} Mo)`);
  console.log('\nRépartition par extension:');
  for (const [ext, count] of Object.entries(extCounts)) {
    console.log(`  ${ext}: ${count} fichier(s)`);
  }

  console.log('\nRépartition par type MIME détecté (Magic Bytes):');
  for (const [mime, count] of Object.entries(mimeCounts)) {
    console.log(`  ${mime}: ${count} fichier(s)`);
  }

  const duplicates = Object.entries(hashToFiles).filter(([hash, list]) => list.length > 1);
  console.log(`\nDoublons de contenu détectés (même contenu SHA-256): ${duplicates.length}`);
  duplicates.forEach(([hash, list]) => {
    console.log(`  Hash ${hash.substring(0, 10)}...:`);
    list.forEach(f => console.log(`    - ${f.fileName} (${f.size} octets)`));
  });

  console.log(`\nFichiers suspects / invalides (magic bytes ou extension): ${invalidFiles.length}`);
  invalidFiles.forEach(f => {
    console.log(`    - ${f.fileName} (ext: ${f.ext}, détecté: ${f.detected}, taille: ${f.size})`);
  });

  console.log('\nVérification de la vidéo du Reel:');
  const reelVideoFilename = path.basename(reel.videoUrl);
  const reelVideoExists = fs.existsSync(path.join(uploadsDir, reelVideoFilename));
  console.log(`  Fichier référencé: ${reelVideoFilename}`);
  console.log(`  Existe dans public/uploads : ${reelVideoExists ? 'OUI' : 'NON'}`);
}

audit();
