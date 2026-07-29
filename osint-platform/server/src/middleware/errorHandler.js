export function notFoundHandler(req, res) {
  res.status(404).json({ message: `No route for ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === 'MulterError') {
    const message =
      err.code === 'LIMIT_FILE_SIZE' ? 'File is too large. Max size is 15MB.' : err.message;
    return res.status(400).json({ message });
  }
  if (err.message?.includes('Unsupported file type')) {
    return res.status(400).json({ message: err.message });
  }

  const status = err.status || 500;
  res.status(status).json({
    message: err.expose ? err.message : 'Something went wrong on our end.',
  });
}
