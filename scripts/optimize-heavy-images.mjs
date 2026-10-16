import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

// Disable file cache to prevent Windows file locking
sharp.cache(false)

const PUBLIC_DIR = path.resolve('public')
const SIZE_THRESHOLD_BYTES = 700 * 1024 // Optimize any image > 700 KB

function getAllImages(dir) {
  let results = []
  const list = fs.readdirSync(dir)
  for (const file of list) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      results = results.concat(getAllImages(fullPath))
    } else {
      const ext = path.extname(file).toLowerCase()
      if (['.jpg', '.jpeg', '.png'].includes(ext) && stat.size > SIZE_THRESHOLD_BYTES) {
        results.push({ fullPath, size: stat.size, ext, name: file })
      }
    }
  }
  return results
}

async function optimizeImage(item) {
  const { fullPath, size, ext, name } = item
  try {
    // Read directly into memory buffer so Windows doesn't lock the file handle
    const inputBuffer = fs.readFileSync(fullPath)
    const metadata = await sharp(inputBuffer).metadata()

    let pipeline = sharp(inputBuffer)

    // Resize if oversized for web display (> 1920px)
    if (metadata.width > 1920 || metadata.height > 1920) {
      pipeline = pipeline.resize(1920, 1920, {
        fit: 'inside',
        withoutEnlargement: true
      })
    }

    let buffer
    if (ext === '.png') {
      buffer = await pipeline
        .png({
          compressionLevel: 9,
          effort: 8,
          quality: 85
        })
        .toBuffer()
    } else {
      buffer = await pipeline
        .jpeg({
          mozjpeg: true,
          quality: 82
        })
        .toBuffer()
    }

    if (buffer.length < size) {
      // Write to temp file then rename to avoid any locked file issues on Windows
      const tempPath = fullPath + '.tmp'
      fs.writeFileSync(tempPath, buffer)
      fs.unlinkSync(fullPath)
      fs.renameSync(tempPath, fullPath)

      const savedKB = Math.round((size - buffer.length) / 1024)
      const newKB = Math.round(buffer.length / 1024)
      const oldKB = Math.round(size / 1024)
      const percent = Math.round(((size - buffer.length) / size) * 100)
      console.log(`✓ ${name}: ${oldKB} KB -> ${newKB} KB (-${percent}%, saved ${savedKB} KB)`)
      return { oldSize: size, newSize: buffer.length }
    } else {
      console.log(`- ${name}: already optimal`)
      return { oldSize: size, newSize: size }
    }
  } catch (err) {
    console.error(`✗ Error optimizing ${name}:`, err.message)
    return { oldSize: size, newSize: size }
  }
}

async function main() {
  console.log('🔍 Scanning public/ for heavy images (> 700 KB)...')
  const images = getAllImages(PUBLIC_DIR)
  console.log(`Found ${images.length} images to optimize.\n`)

  let totalOld = 0
  let totalNew = 0

  for (const img of images) {
    const res = await optimizeImage(img)
    totalOld += res.oldSize
    totalNew += res.newSize
  }

  const oldMB = (totalOld / (1024 * 1024)).toFixed(2)
  const newMB = (totalNew / (1024 * 1024)).toFixed(2)
  const savedMB = ((totalOld - totalNew) / (1024 * 1024)).toFixed(2)
  const percent = totalOld > 0 ? Math.round(((totalOld - totalNew) / totalOld) * 100) : 0

  console.log('\n=======================================')
  console.log(`Total original : ${oldMB} MB`)
  console.log(`Total optimisé : ${newMB} MB`)
  console.log(`Économie totale: ${savedMB} MB (-${percent}%)`)
  console.log('=======================================')
}

main()
