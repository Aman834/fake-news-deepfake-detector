import React, { useState } from 'react';
import {
  Box, Container, Typography, Button, CircularProgress, Alert, Grid,
} from '@mui/material';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import { detectVideo } from '../services/api';
import UploadBox from '../components/UploadBox';
import ResultsCard from '../components/ResultsCard';
import VideoAnalyzer from '../components/VideoAnalyzer';

export default function VideoDetectionPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const response = await detectVideo(file);
      setResult(response);
    } catch (err) {
      setError(err.response?.data?.detail || 'Video analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, animation: 'fadeIn 0.5s ease-out' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#f1f5f9', mb: 1 }}>
          🎬 Deepfake Video Detection
        </Typography>
        <Typography variant="body1" sx={{ color: '#94a3b8' }}>
          Upload a video for frame-level deepfake analysis with temporal aggregation.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <UploadBox
              accept="video/mp4,video/avi,video/mov,video/webm,.mp4,.avi,.mov,.webm"
              onFileSelect={handleFileSelect}
              label="Drop video here or click to upload"
              icon={<VideoLibraryIcon sx={{ fontSize: 56, color: '#8338ec', opacity: 0.8 }} />}
              maxSize="100MB"
            />

            {file && (
              <Button
                id="analyze-video-btn"
                variant="contained"
                onClick={handleAnalyze}
                disabled={loading}
                endIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(135deg, #8338ec, #ff006e)',
                  borderRadius: 3,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '1rem',
                  '&:hover': { background: 'linear-gradient(135deg, #7028d4, #e6005c)' },
                }}
              >
                {loading ? 'Analyzing Video...' : 'Analyze Video'}
              </Button>
            )}

            {loading && (
              <Box sx={{
                p: 3, borderRadius: 3, textAlign: 'center',
                background: 'rgba(17, 24, 39, 0.6)',
                border: '1px solid rgba(131, 56, 236, 0.2)',
              }}>
                <CircularProgress size={40} sx={{ color: '#8338ec', mb: 2 }} />
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                  Extracting frames, detecting faces, & running deepfake analysis...
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', mt: 1, display: 'block' }}>
                  This may take a moment for longer videos
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={7}>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          {result && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, animation: 'slideUp 0.5s ease-out' }}>
              <ResultsCard result={result} type="VIDEO" />
              <VideoAnalyzer result={result} />

              {/* Video info */}
              {result.video_info && (
                <Box sx={{
                  p: 2, borderRadius: 2,
                  background: 'rgba(17, 24, 39, 0.5)',
                  border: '1px solid rgba(148, 163, 184, 0.08)',
                  display: 'flex', gap: 3, flexWrap: 'wrap',
                }}>
                  {[
                    { label: 'Duration', value: `${result.video_info.duration_seconds}s` },
                    { label: 'FPS', value: result.video_info.fps?.toFixed(0) },
                    { label: 'Resolution', value: `${result.video_info.width}×${result.video_info.height}` },
                    { label: 'Total Frames', value: result.video_info.total_frames },
                  ].map((info, idx) => (
                    <Box key={idx}>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>{info.label}</Typography>
                      <Typography variant="body2" sx={{ color: '#f1f5f9', fontWeight: 600, fontFamily: 'monospace' }}>
                        {info.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {!result && !error && !loading && (
            <Box sx={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', height: 300,
              borderRadius: 3, border: '1px dashed rgba(148, 163, 184, 0.15)',
              background: 'rgba(17, 24, 39, 0.3)',
            }}>
              <Typography variant="h1" sx={{ fontSize: '3rem', mb: 1 }}>🎥</Typography>
              <Typography variant="body1" sx={{ color: '#64748b' }}>
                Upload a video to see deepfake analysis
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
