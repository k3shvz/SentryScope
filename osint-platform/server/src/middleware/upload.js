import multer from 'multer';

const ALLOWED_MIME_PREFIXES = ['image/', 'application/pdf'];
const ALLOWED_EXACT_MIME = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
];

const MAGIC_NUMBERS = {
  'image/jpeg': [Buffer.from([0xff, 0xd8, 0xff])],
  'image/png': [Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
  'image/gif': [Buffer.from([0x47, 0x49, 0x46, 0x38])],
  'image/webp': [Buffer.from([0x52, 0x49, 0x46, 0x46]), Buffer.from([0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70])],
  'image/bmp': [Buffer.from([0x42, 0x4d])],
  'image/tiff': [Buffer.from([0x49, 0x49, 0x2a, 0x00]), Buffer.from([0x4d, 0x4d, 0x00, 0x2a])],
  'application/pdf': [Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d])],
  'application/zip': [Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.from([0x50, 0x4b, 0x05, 0x06]), Buffer.from([0x50, 0x4b, 0x07, 0x08])],
};

function sniffMimeType(buffer) {
  for (const [mime, signatures] of Object.entries(MAGIC_NUMBERS)) {
    for (const sig of signatures) {
      if (buffer.length >= sig.length && buffer.slice(0, sig.length).equals(sig)) {
        return mime;
      }
    }
  }
  return null;
}

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const okPrefix = ALLOWED_MIME_PREFIXES.some((p) => file.mimetype.startsWith(p));
    const okExact = ALLOWED_EXACT_MIME.includes(file.mimetype);
    if (!okPrefix && !okExact) {
      return cb(new Error('Unsupported file type. Upload a PDF, DOCX, PPTX, or image.'));
    }
    cb(null, true);
  },
});

export function validateFileSignature(req, res, next) {
  const file = req.file;
  if (!file) return next();
  const detected = sniffMimeType(file.buffer);
  if (!detected) {
    return res.status(400).json({ message: 'File signature does not match the declared type.' });
  }
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 'application/pdf', 'application/zip'];
  if (!allowed.includes(detected)) {
    return res.status(400).json({ message: 'Unsupported file type.' });
  }
  if (file.mimetype.startsWith('image/') && !detected.startsWith('image/')) {
    return res.status(400).json({ message: 'File signature does not match an image type.' });
  }
  if (file.mimetype === 'application/pdf' && detected !== 'application/pdf') {
    return res.status(400).json({ message: 'File signature does not match PDF.' });
  }
  if (file.mimetype.includes('wordprocessingml') || file.mimetype.includes('presentationml') || file.mimetype === 'application/msword') {
    if (detected !== 'application/zip') {
      return res.status(400).json({ message: 'File signature does not match an Office document.' });
    }
  }
  next();
}
