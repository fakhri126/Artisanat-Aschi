import fs from 'fs'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'

const execFileAsync = promisify(execFile)
const ffmpegPath = ffmpegInstaller?.path

const UPLOADS_DIR = path.resolve('public', 'uploads')

const ACTIVE_VIDEOS = [
  '1790852145325-lv_0_20260921162458.mp4', // Savoir-faire video
  '1788370150280-villasoukra.mp4',         // Villa Soukra
  '1789912103615-lv_0_20260904092720.mp4', // Diar Ali
  '0ca5bec6-900a-4232-b65c-81658df964f2.mp4', // Hôtel El Menara
  '1790416203249-lv_0_20260918163259.mp4', // Villa d'exception
  '1789913768743-lv_0_20260910130311.mp4', // AFI
  '1790851779801-lv_0_20260922171936.mp4', // Projet
  '1788412722399-villacarthage.mp4',       // Villa Carthage
  '1786460144479-WhatsAppVideo2026-08-11at15.33.26.mp4', // Projet
  'Video.mp4',
  '1790323039663-lv_0_20260922171936.mp4',
  'Video-art.mp4'
]

async function optimizeVideo(fileName) {
  const inputPath = path.join(UPLOADS_DIR, fileName)
  if (!fs.existsSync(inputPath)) {
    console.log(`⚠️ Introuvable : ${fileName}`)
    return { oldSize: 0, newSize: 0 }
  }

  const initialStat = fs.statSync(inputPath)
  const initialMb = (initialStat.size / (1024 * 1024)).toFixed(2)
  const outputPath = path.join(UPLOADS_DIR, `opt-${fileName}`)

  const ffmpegArgs = [
    '-i', inputPath,
    '-vf', "scale='min(1280,iw)':-2",
    '-c:v', 'libx264',
    '-crf', '26',
    '-preset', 'fast',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-movflags', '+faststart',
    outputPath,
    '-y'
  ]

  try {
    process.stdout.write(`⏳ Compression de ${fileName} (${initialMb} Mo)... `)
    await execFileAsync(ffmpegPath, ffmpegArgs)

    const optStat = fs.statSync(outputPath)
    const optMb = (optStat.size / (1024 * 1024)).toFixed(2)
    const savedMb = ((initialStat.size - optStat.size) / (1024 * 1024)).toFixed(2)
    const percent = Math.round(((initialStat.size - optStat.size) / initialStat.size) * 100)

    if (optStat.size < initialStat.size) {
      fs.unlinkSync(inputPath)
      fs.renameSync(outputPath, inputPath)
      console.log(`✓ Réussi : ${initialMb} Mo -> ${optMb} Mo (-${percent}%, gagné ${savedMb} Mo)`)
      return { oldSize: initialStat.size, newSize: optStat.size }
    } else {
      fs.unlinkSync(outputPath)
      console.log(`- Déjà optimal : ${initialMb} Mo`)
      return { oldSize: initialStat.size, newSize: initialStat.size }
    }
  } catch (err) {
    console.error(`✗ Erreur sur ${fileName}:`, err.message)
    try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath) } catch (_) {}
    return { oldSize: initialStat.size, newSize: initialStat.size }
  }
}

async function main() {
  console.log('🎬 Lancement de l\'optimisation des vidéos actives avec FFmpeg...\n')
  let totalOld = 0
  let totalNew = 0

  for (const name of ACTIVE_VIDEOS) {
    const res = await optimizeVideo(name)
    totalOld += res.oldSize
    totalNew += res.newSize
  }

  const oldMB = (totalOld / (1024 * 1024)).toFixed(2)
  const newMB = (totalNew / (1024 * 1024)).toFixed(2)
  const savedMB = ((totalOld - totalNew) / (1024 * 1024)).toFixed(2)
  const percent = totalOld > 0 ? Math.round(((totalOld - totalNew) / totalOld) * 100) : 0

  console.log('\n=======================================')
  console.log(`Total vidéos initial : ${oldMB} Mo`)
  console.log(`Total vidéos optimisé: ${newMB} Mo`)
  console.log(`Gain d'espace total  : ${savedMB} Mo (-${percent}%)`)
  console.log('=======================================')
}

main()
