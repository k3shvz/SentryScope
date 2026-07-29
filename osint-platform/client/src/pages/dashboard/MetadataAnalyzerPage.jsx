import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiHash, FiUser, FiMapPin } from 'react-icons/fi';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import FileDropzone from '../../components/ui/FileDropzone';
import { SkeletonCard } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { useHistory } from '../../context/HistoryContext';
import api from '../../utils/api';

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0 gap-3">
      <span className="text-xs text-text-muted flex-shrink-0">{label}</span>
      <span className="text-xs text-text font-medium text-right truncate">{value}</span>
    </div>
  );
}

export default function MetadataAnalyzerPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { push } = useToast();
  const { logInvestigation } = useHistory();

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
      formData.append('file', file);
      const { data } = await api.post('/metadata', formData);
      setResult(data);
      push('Metadata extracted.', 'success');
      logInvestigation({
        type: 'Metadata',
        target: file.name,
        risk: data.gps ? 'medium' : 'low',
        summary: `${data.fileType} · author: ${data.author || 'unknown'}${data.gps ? ' · GPS location embedded' : ''}`,
      });
    } catch (err) {
      push(err?.response?.data?.message || 'Could not analyze this file.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-text">Metadata Analyzer</h1>
        <p className="text-text-muted text-sm mt-1">
          Upload a PDF, Word, PowerPoint, or image file to extract author, software, dates,
          and any embedded location data.
        </p>
      </div>

      <Card>
        <CardHeader icon={FiFileText} title="Upload a document or image" />
        <FileDropzone
          accept=".pdf,.docx,.pptx,image/*"
          file={file}
          onFileSelect={handleFileSelect}
          onClear={() => {
            setFile(null);
            setResult(null);
          }}
          hint="PDF, DOCX, PPTX, or image · up to 15MB"
        />
        {file && (
          <Button className="mt-4 w-full" onClick={handleAnalyze} loading={loading}>
            Analyze metadata
          </Button>
        )}
      </Card>

      {loading && <SkeletonCard />}

      {!loading && !result && (
        <Card>
          <EmptyState
            icon={FiFileText}
            title="No file analyzed yet"
            description="Upload a file above and click Analyze to see its hidden metadata."
          />
        </Card>
      )}

      {!loading && result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card>
            <CardHeader icon={FiUser} title="Document properties" subtitle={result.fileType} />
            <Field label="Title" value={result.title} />
            <Field label="Author / Creator" value={result.author} />
            <Field label="Last modified by" value={result.lastModifiedBy} />
            <Field label="Subject" value={result.subject} />
            <Field label="Application" value={result.application || result.creator} />
            <Field label="Producer" value={result.producer} />
            <Field label="Company" value={result.company} />
            <Field
              label="Created"
              value={result.createdAt ? new Date(result.createdAt).toLocaleString() : null}
            />
            <Field
              label="Modified"
              value={result.modifiedAt ? new Date(result.modifiedAt).toLocaleString() : null}
            />
            <Field label="Pages / Slides" value={result.pageCount || result.slideOrPageCount} />
            {result.dimensions && (
              <Field label="Dimensions" value={`${result.dimensions.width} × ${result.dimensions.height}px`} />
            )}
            {result.camera && <Field label="Camera" value={result.camera} />}
            {result.gps && (
              <div className="flex items-center gap-2 py-2 text-warning">
                <FiMapPin size={13} />
                <span className="text-xs font-medium">
                  GPS location embedded: {result.gps.latitude.toFixed(5)}, {result.gps.longitude.toFixed(5)}
                </span>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader icon={FiHash} title="File hashes" subtitle="For chain-of-custody or duplicate detection" />
            <div className="space-y-2 font-mono-num text-xs">
              <div className="flex gap-2">
                <span className="text-text-faint flex-shrink-0">MD5:</span>
                <span className="text-text-muted break-all">{result.hashes?.md5}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-text-faint flex-shrink-0">SHA-256:</span>
                <span className="text-text-muted break-all">{result.hashes?.sha256}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
