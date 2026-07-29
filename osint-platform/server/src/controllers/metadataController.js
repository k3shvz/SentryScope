import { createHash } from 'crypto';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import exifr from 'exifr';
import { imageSize } from 'image-size';
import { recordInvestigation } from '../services/analytics.js';

function hashBuffer(buffer) {
  return {
    md5: createHash('md5').update(buffer).digest('hex'),
    sha256: createHash('sha256').update(buffer).digest('hex'),
  };
}

// Minimal, purpose-built XML tag extractor for the known OOXML core/app
// properties schema — avoids pulling in a full XML parser dependency for a
// handful of well-known, predictable tags.
function extractXmlTag(xml, tagLocalName) {
  const regex = new RegExp(`<[^:>]*:?${tagLocalName}[^>]*>([\\s\\S]*?)<\\/[^:>]*:?${tagLocalName}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

async function extractPdfMetadata(buffer) {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true, updateMetadata: false });
  return {
    fileType: 'PDF',
    title: doc.getTitle() || null,
    author: doc.getAuthor() || null,
    subject: doc.getSubject() || null,
    keywords: doc.getKeywords() || null,
    creator: doc.getCreator() || null,
    producer: doc.getProducer() || null,
    createdAt: doc.getCreationDate()?.toISOString() || null,
    modifiedAt: doc.getModificationDate()?.toISOString() || null,
    pageCount: doc.getPageCount(),
  };
}

async function extractOoxmlMetadata(buffer, kind) {
  const zip = await JSZip.loadAsync(buffer);
  const coreFile = zip.file('docProps/core.xml');
  const appFile = zip.file('docProps/app.xml');
  const core = coreFile ? await coreFile.async('string') : '';
  const app = appFile ? await appFile.async('string') : '';

  return {
    fileType: kind,
    title: extractXmlTag(core, 'title'),
    author: extractXmlTag(core, 'creator'),
    lastModifiedBy: extractXmlTag(core, 'lastModifiedBy'),
    createdAt: extractXmlTag(core, 'created'),
    modifiedAt: extractXmlTag(core, 'modified'),
    revision: extractXmlTag(core, 'revision'),
    application: extractXmlTag(app, 'Application'),
    company: extractXmlTag(app, 'Company'),
    slideOrPageCount: extractXmlTag(app, 'Slides') || extractXmlTag(app, 'Pages'),
  };
}

async function extractImageMetadata(buffer) {
  let exif = null;
  try {
    exif = await exifr.parse(buffer, { gps: true, translateValues: true, reviveValues: true });
  } catch {
    exif = null;
  }

  let dimensions = null;
  try {
    const { width, height, type } = imageSize(buffer);
    dimensions = { width, height, format: type };
  } catch {
    dimensions = null;
  }

  return {
    fileType: 'Image',
    dimensions,
    camera: exif ? [exif.Make, exif.Model].filter(Boolean).join(' ') || null : null,
    lens: exif?.LensModel || null,
    software: exif?.Software || null,
    takenAt: exif?.DateTimeOriginal ? new Date(exif.DateTimeOriginal).toISOString() : null,
    gps: exif?.latitude && exif?.longitude ? { latitude: exif.latitude, longitude: exif.longitude } : null,
    iso: exif?.ISO || null,
    exposureTime: exif?.ExposureTime || null,
    fNumber: exif?.FNumber || null,
    focalLength: exif?.FocalLength || null,
  };
}

export async function analyzeMetadata(req, res) {
  const file = req.file;
  if (!file) return res.status(400).json({ message: 'No file uploaded.' });

  const hashes = hashBuffer(file.buffer);
  const base = {
    fileName: file.originalname,
    fileSizeBytes: file.size,
    mimeType: file.mimetype,
    hashes,
  };

  try {
    let extracted;
    if (file.mimetype === 'application/pdf') {
      extracted = await extractPdfMetadata(file.buffer);
    } else if (file.mimetype.startsWith('image/')) {
      extracted = await extractImageMetadata(file.buffer);
    } else if (file.mimetype.includes('wordprocessingml')) {
      extracted = await extractOoxmlMetadata(file.buffer, 'Word Document (.docx)');
    } else if (file.mimetype.includes('presentationml')) {
      extracted = await extractOoxmlMetadata(file.buffer, 'PowerPoint (.pptx)');
    } else {
      extracted = { fileType: 'Unknown', note: 'No structured metadata extractor for this file type yet.' };
    }
    recordInvestigation({ type: 'Metadata', target: file.originalname, risk: 'low', profilesFound: 1 });
    res.json({ ...base, ...extracted });
  } catch (err) {
    res.status(422).json({
      message: 'Could not parse this file. It may be corrupted, password-protected, or in an unexpected format.',
    });
  }
}
