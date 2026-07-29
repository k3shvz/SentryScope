import { createHash } from 'crypto';
import exifr from 'exifr';
import { imageSize } from 'image-size';
import { recordInvestigation } from '../services/analytics.js';

export async function analyzeImage(req, res) {
  const file = req.file;
  if (!file) return res.status(400).json({ message: 'No image uploaded.' });
  if (!file.mimetype.startsWith('image/')) {
    return res.status(400).json({ message: 'Uploaded file is not an image.' });
  }

  try {
    let exif = null;
    try {
      exif = await exifr.parse(file.buffer, { gps: true, translateValues: true, reviveValues: true });
    } catch {
      exif = null;
    }

    let dimensions = null;
    try {
      const { width, height, type } = imageSize(file.buffer);
      dimensions = { width, height, format: type };
    } catch {
      dimensions = null;
    }

    const sha256 = createHash('sha256').update(file.buffer).digest('hex');
    const md5 = createHash('md5').update(file.buffer).digest('hex');

    recordInvestigation({ type: 'Image', target: file.originalname, risk: exif?.latitude ? 'high' : 'low', profilesFound: 1 });
    res.json({
      fileName: file.originalname,
      fileSizeBytes: file.size,
      mimeType: file.mimetype,
      dimensions,
      hashes: { sha256, md5 },
      camera: exif ? [exif.Make, exif.Model].filter(Boolean).join(' ') || null : null,
      lens: exif?.LensModel || null,
      software: exif?.Software || null,
      takenAt: exif?.DateTimeOriginal ? new Date(exif.DateTimeOriginal).toISOString() : null,
      gps: exif?.latitude && exif?.longitude ? { latitude: exif.latitude, longitude: exif.longitude } : null,
      iso: exif?.ISO || null,
      exposureTime: exif?.ExposureTime || null,
      fNumber: exif?.FNumber || null,
      focalLength: exif?.FocalLength || null,
      orientation: exif?.Orientation || null,
      hasEmbeddedLocation: Boolean(exif?.latitude && exif?.longitude),
    });
  } catch {
    res.status(422).json({ message: 'Could not read this image. It may be corrupted or in an unsupported format.' });
  }
}
