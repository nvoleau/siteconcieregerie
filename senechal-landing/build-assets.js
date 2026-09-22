const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMG_DIR = path.join(__dirname, 'img');
fs.mkdirSync(IMG_DIR, { recursive: true });

const NAVY = '#17243B';
const GOLD = '#C7A274';

async function main() {
  // --- Blason (hero image), cropped from the full lockup to isolate the crest
  // (crown + shield + scrollwork) and exclude the "LE SÉNÉCHAL" wordmark,
  // which already appears as text in the header. Target display size 500x506,
  // provide 1x and 2x. ---
  const blasonSrc = sharp('assets/senechal-blason.jpg').extract({ left: 888, top: 27, width: 1040, height: 1053 });
  await blasonSrc.clone().resize(500, 506, { fit: 'cover' }).webp({ quality: 82 }).toFile(path.join(IMG_DIR, 'blason-500.webp'));
  await blasonSrc.clone().resize(500, 506, { fit: 'cover' }).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(IMG_DIR, 'blason-500.jpg'));
  await blasonSrc.clone().resize(1000, 1012, { fit: 'cover' }).webp({ quality: 80 }).toFile(path.join(IMG_DIR, 'blason-1000.webp'));
  await blasonSrc.clone().resize(1000, 1012, { fit: 'cover' }).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(IMG_DIR, 'blason-1000.jpg'));

  // --- Photo "Ancrage local" (chemin du Bocage), cadrée sur le ratio 6:7
  // utilisé par .local-photo dans le CSS. Source basse résolution : une seule
  // taille, pas de variante retina factice. ---
  const localPhotoPath = path.join(__dirname, 'assets', 'bocage-chemin.jpg');
  if (fs.existsSync(localPhotoPath)) {
    const localSrc = sharp(localPhotoPath).resize(480, 560, { fit: 'cover' });
    await localSrc.clone().webp({ quality: 80 }).toFile(path.join(IMG_DIR, 'bocage-chemin.webp'));
    await localSrc.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(IMG_DIR, 'bocage-chemin.jpg'));
  }

  // --- Open Graph image 1200x630, derived from full logo (navy background) ---
  await sharp('assets/senechal-logo-complet.jpg')
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(path.join(IMG_DIR, 'og-image.jpg'));

  // --- Favicon: provisional "S" gold on navy rounded square ---
  const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${NAVY}"/>
  <text x="32" y="45" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="38" font-weight="600" fill="${GOLD}">S</text>
</svg>`.trim();
  fs.writeFileSync(path.join(IMG_DIR, 'favicon.svg'), svgIcon);

  const svgBuffer = Buffer.from(svgIcon);
  await sharp(svgBuffer, { density: 384 }).resize(180, 180).png().toFile(path.join(IMG_DIR, 'apple-touch-icon-180.png'));
  await sharp(svgBuffer, { density: 384 }).resize(192, 192).png().toFile(path.join(IMG_DIR, 'favicon-192.png'));
  await sharp(svgBuffer, { density: 384 }).resize(512, 512).png().toFile(path.join(IMG_DIR, 'favicon-512.png'));
  await sharp(svgBuffer, { density: 384 }).resize(32, 32).png().toFile(path.join(IMG_DIR, 'favicon-32.png'));

  console.log('done');
}

main().catch((e) => { console.error(e); process.exit(1); });
