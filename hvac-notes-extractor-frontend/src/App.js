import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://<YOUR-SERVER-IP>:8000';
  const ENDPOINT = `${API_BASE_URL}/api/extract-notes`;
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files && e.target.files[0];
    setFile(selected || null);
    setFileName(selected ? selected.name : '');
    setNotes('');
    setResult(null);
    setSuccess(false);
    setError('');
  };

  const handleCopyJson = async () => {
    if (!result) return;
    const jsonText = JSON.stringify(result, null, 2);
    try {
      await navigator.clipboard.writeText(jsonText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      // Fallback: create a temporary textarea for copy
      try {
        const ta = document.createElement('textarea');
        ta.value = jsonText;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch (_) {
        // ignore
      }
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a PDF file first.');
      return;
    }
    setLoading(true);
    setError('');
    setNotes('');
    setResult(null);
    setSuccess(false);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(ENDPOINT, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = response?.data ?? null;
      const text = data?.text ?? '';
      setNotes(text);
      setResult(data);
      setSuccess(true);
    } catch (err) {
      setError('Failed to fetch notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App" style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <h1>HVAC Notes Extractor</h1>

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="pdf-upload" style={{ marginRight: 8 }}>PDF file</label>
        <input
          id="pdf-upload"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          aria-label="PDF file"
        />
      </div>

      {fileName && (
        <div style={{ marginBottom: 12 }}>Selected file: <strong>{fileName}</strong></div>
      )}

      <div style={{ marginBottom: 12 }}>
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Processing…' : 'Get Notes'}
        </button>
      </div>

      {error && (
        <div role="alert" style={{ color: 'red', marginBottom: 12 }}>{error}</div>
      )}

      {success && !error && (
        <div role="status" style={{ color: 'green', marginBottom: 12 }}>
          Success! Notes extracted.
        </div>
      )}

      {notes && (
        <div>
          <h2>Extracted Notes</h2>
          <pre style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>{notes}</pre>
        </div>
      )}

      {result && (
        <div style={{ marginTop: 16, textAlign: 'left' }}>
          <h2 style={{ marginBottom: 8 }}>Response JSON</h2>
          <div style={{ position: 'relative' }}>
            <button
              onClick={handleCopyJson}
              aria-label="Copy JSON"
              title="Copy JSON"
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1,
                padding: '6px 10px',
                fontSize: 12,
                borderRadius: 4,
                border: '1px solid #d0d7de',
                background: copied ? '#d1f7c4' : '#f6f8fa',
                cursor: 'pointer',
              }}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
            <pre style={{
              background: '#f6f8fa',
              border: '1px solid #e1e4e8',
              borderRadius: 4,
              padding: 12,
              paddingRight: 56,
              overflowX: 'auto',
              margin: 0,
            }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
