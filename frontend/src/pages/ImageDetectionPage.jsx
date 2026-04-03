import React, { useState } from 'react';
import {
  Box, Container, Typography, Button, CircularProgress, Alert, Grid, Paper,
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import { detectImage } from '../services/api';
import UploadBox from '../components/UploadBox';
import ResultsCard from '../components/ResultsCard';

export default function ImageDetectionPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    setError(null);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const response = await detectImage(file);
      setResult(response);
    } catch (err) {
      setError(err.response?.data?.detail || 'Image analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, animation: 'fadeIn 0.5s ease-out' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#f1f5f9', mb: 1 }}>
          🖼️ Image Manipulation Detection
        </Typography>
        <Typography variant="body1" sx={{ color: '#94a3b8' }}>
          Upload an image to detect face swaps, GAN-generated content, and digital manipulation.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <UploadBox
              accept="image/jpeg,image/png,image/webp,image/bmp"
              onFileSelect={handleFileSelect}
              label="Drop image here or click to upload"
              icon={<ImageIcon sx={{ fontSize: 56, color: '#118ab2', opacity: 0.8 }} />}
            />

            {preview && (
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  maxHeight: 400,
                }}
              >
                <img
                  src={preview}
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    maxHeight: 400,
                    backgroundColor: '#0a0e17',
                  }}
                />
              </Paper>
            )}

            {file && (
              <Button
                id="analyze-image-btn"
                variant="contained"
                onClick={handleAnalyze}
                disabled={loading}
                endIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(135deg, #118ab2, #8338ec)',
                  borderRadius: 3,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '1rem',
                  '&:hover': { background: 'linear-gradient(135deg, #0f7a9e, #7028d4)' },
                }}
              >
                {loading ? 'Analyzing...' : 'Analyze Image'}
              </Button>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          {result && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, animation: 'slideUp 0.5s ease-out' }}>
              <ResultsCard result={result} type="IMAGE" />

              {/* Manipulation types */}
              {result.manipulation_types && result.manipulation_types.length > 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3, borderRadius: 3,
                    background: 'rgba(17, 24, 39, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#f1f5f9', mb: 2 }}>
                    🔎 Manipulation Analysis
                  </Typography>
                  {result.manipulation_types.map((item, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 2, mb: 1.5, borderRadius: 2,
                        backgroundColor: 'rgba(239, 68, 68, 0.06)',
                        borderLeft: '3px solid #ef4444',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ color: '#f1f5f9', fontWeight: 700 }}>
                        {item.type}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        {item.indicator} • Confidence: {(item.confidence * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              )}

              {/* Face analysis */}
              {result.face_analysis && result.face_analysis.length > 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3, borderRadius: 3,
                    background: 'rgba(17, 24, 39, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#f1f5f9', mb: 2 }}>
                    👤 Per-Face Analysis
                  </Typography>
                  {result.face_analysis.map((face, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', p: 1.5, mb: 1, borderRadius: 2,
                        backgroundColor: 'rgba(148, 163, 184, 0.05)',
                      }}
                    >
                      <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                        Face #{face.face_index + 1}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: face.prediction === 'Manipulated' ? '#ef4444' : '#06d6a0',
                        }}
                      >
                        {face.prediction} ({(face.confidence * 100).toFixed(0)}%)
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              )}
            </Box>
          )}

          {!result && !error && (
            <Box sx={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', height: 300,
              borderRadius: 3, border: '1px dashed rgba(148, 163, 184, 0.15)',
              background: 'rgba(17, 24, 39, 0.3)',
            }}>
              <Typography variant="h1" sx={{ fontSize: '3rem', mb: 1 }}>🔍</Typography>
              <Typography variant="body1" sx={{ color: '#64748b' }}>
                Upload an image to see analysis results
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
