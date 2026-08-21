const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// __dirname = .../portfolio-site/scripts — so go up one level
const PROJECT = path.join(__dirname, '..');
const BASE = '/Users/blessing/Desktop/portfolio vidéaste';
const OUT_BASE = path.join(PROJECT, 'public/media');

const jobs = [
  {
    src: path.join(BASE, 'Ayele shooting'),
    outDir: path.join(OUT_BASE, 'ayele'),
    files: ['as.jpeg', 'as1.jpeg', 'as2.jpeg', 'as3.jpeg', 'as4.jpeg'],
  },
  {
    src: path.join(BASE, 'Fiançailles shooting '),
    outDir: path.join(OUT_BASE, 'fiancailles'),
    files: [
      'fi1.jpeg','fi2.jpeg','fi3.jpeg','fi4.jpeg','fi5.jpeg',
      'fi6.jpeg','fi7.jpeg','fi8.jpeg','fi9.jpeg','fi10.jpeg',
      'fi11.jpeg','fi12.jpeg','fi13.jpeg','fi14.jpeg','fi15.jpeg',
      'fi16.jpeg','fi17.jpeg','fi18.jpeg','fi19.jpeg','fi20.jpeg',
      'fi21.jpeg','fi22.jpeg',
    ],
  },
  {
    src: path.join(BASE, 'Joanna shooting '),
    outDir: path.join(OUT_BASE, 'joanna'),
    files: ['js1.jpeg', 'js2.jpeg', 'js3.jpeg'],
  },
  {
    src: path.join(BASE, 'Shooting modele'),
    outDir: path.join(OUT_BASE, 'modele'),
    files: ['sm1.jpeg', 'sm2.jpeg', 'sm3.jpeg'],
  },
  {
    src: path.join(BASE, 'Shooting oceane codjia'),
    outDir: path.join(OUT_BASE, 'oceane'),
    files: ['oc1.jpeg','oc2.jpeg','oc3.jpeg','oc4.jpeg','oc5.jpeg','oc6.jpeg'],
  },
  {
    src: path.join(BASE, 'Zya shooting'),
    outDir: path.join(OUT_BASE, 'zya'),
    files: ['zs1.jpeg','zs2.jpeg','zs3.jpeg','zs4.jpeg','zs5.jpeg'],
  },
];

async function run() {
  let total = 0;
  let errors = 0;
  for (const job of jobs) {
    fs.mkdirSync(job.outDir, { recursive: true });
    console.log('Processing folder:', path.basename(job.outDir));
    for (const file of job.files) {
      const srcPath = path.join(job.src, file);
      const outName = path.basename(file, path.extname(file)) + '.jpg';
      const outPath = path.join(job.outDir, outName);
      if (!fs.existsSync(srcPath)) {
        console.log('  MISSING:', srcPath);
        errors++;
        continue;
      }
      try {
        const info = await sharp(srcPath)
          .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 82, mozjpeg: true })
          .toFile(outPath);
        total++;
        console.log('  OK:', outName, Math.round(info.size / 1024) + 'KB');
      } catch (e) {
        console.error('  ERR', file, e.message);
        errors++;
      }
    }
  }

  // Also optimize tof du videaste port9
  const port9Src = path.join(BASE, 'tof du vidéaste', 'port9.jpeg');
  const port9Out = path.join(OUT_BASE, 'portraits', 'port9.jpg');
  if (fs.existsSync(port9Src)) {
    try {
      const info = await sharp(port9Src)
        .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(port9Out);
      total++;
      console.log('OK: port9.jpg', Math.round(info.size / 1024) + 'KB');
    } catch (e) {
      console.error('ERR port9', e.message);
    }
  }

  console.log('\n=== DONE:', total, 'photos optimized,', errors, 'errors ===');
}

run().catch(console.error);
