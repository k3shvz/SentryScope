import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiImage, FiMapPin, FiHash, FiCamera } from 'react-icons/fi';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import FileDropzone from '../../components/ui/FileDropzone';
import { SkeletonCard } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import StatusChip from '../../components/ui/StatusChip';
import { useToast } from '../../context/ToastContext';
import { useHistory } from '../../context/HistoryContext';
import api from '../../utils/api';

function Field({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0 gap-3">
      <span className="text-xs text-text-muted flex-shrink-0">{label}</span>
      <span className="text-xs text-text font-medium text-right truncate">{value}</span>
    </div>
  );
}

export default function ImageAnalyzerPage() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { push } = useToast();
  const { logInvestigation } = useHistory();

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleFileSelect(selected) {
    setFile(selected);
    setResult(null);
  }

  async function handleAnalyze() {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await api.post('/image', formData);
      setResult(data);
      push('Image analyzed.', 'success');
      logInvestigation({
        type: 'Image',
        target: file.name,
        risk: data.hasEmbeddedLocation ? 'high' : 'low',
        summary: data.hasEmbeddedLocation
          ? 'Embedded GPS location found in image metadata'
          : 'No embedded location data found',
      });
    } catch (err) {
      push(err?.response?.data?.message || 'Could not analyze this image.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text">Image Analyzer</h1>
        <p className="text-text-muted text-sm mt-1">
          Upload an image to inspect its EXIF data, embedded GPS location, camera details, and
          file hash.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader icon={FiImage} title="Upload an image" />
          <FileDropzone
            accept="image/*"
            file={file}
            onFileSelect={handleFileSelect}
            onClear={() => {
              setFile(null);
              setResult(null);
            }}
            hint="JPG, PNG, HEIC, or other common formats · up to 15MB"
          />
          {previewUrl && (
            <div className="mt-4 rounded-xl overflow-hidden border border-border">
              <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover" />
            </div>
          )}
          {file && (
            <Button className="mt-4 w-full" onClick={handleAnalyze} loading={loading}>
              Analyze image
            </Button>
          )}
        </Card>

        <div className="space-y-4">
          {loading && <SkeletonCard />}

          {!loading && !result && (
            <Card className="h-full flex items-center">
              <EmptyState
                icon={FiCamera}
                title="No image analyzed yet"
                description="Upload an image and click Analyze to reveal its hidden metadata."
              />
            </Card>
          )}

          {!loading && result && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {result.hasEmbeddedLocation && (
                <Card className="border-warning/30 bg-warning/5 flex items-start gap-3">
                  <FiMapPin size={16} className="text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-text font-medium">Embedded GPS location found</p>
                    <p className="text-xs text-text-muted mt-1">
                      {result.gps.latitude.toFixed(5)}, {result.gps.longitude.toFixed(5)} — this
                      image reveals exactly where it was taken.
                    </p>
                  </div>
                </Card>
              )}

              <Card>
                <CardHeader
                  icon={FiCamera}
                  title="EXIF & camera details"
                  action={
                    !result.hasEmbeddedLocation && <StatusChip tone="success">No location data</StatusChip>
                  }
                />
                <Field label="Dimensions" value={result.dimensions ? `${result.dimensions.width} × ${result.dimensions.height}px` : null} />
                <Field label="Camera" value={result.camera} />
                <Field label="Lens" value={result.lens} />
                <Field label="Software" value={result.software} />
                <Field label="Taken at" value={result.takenAt ? new Date(result.takenAt).toLocaleString() : null} />
                <Field label="ISO" value={result.iso} />
                <Field label="Exposure time" value={result.exposureTime ? `1/${Math.round(1 / result.exposureTime)}s` : null} />
                <Field label="Aperture" value={result.fNumber ? `f/${result.fNumber}` : null} />
                <Field label="Focal length" value={result.focalLength ? `${result.focalLength}mm` : null} />
              </Card>

              <Card>
                <CardHeader icon={FiHash} title="File hash" />
                <div className="space-y-2 font-mono-num text-xs">
                  <div className="flex gap-2">
                    <span className="text-text-faint flex-shrink-0">SHA-256:</span>
                    <span className="text-text-muted break-all">{result.hashes?.sha256}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
