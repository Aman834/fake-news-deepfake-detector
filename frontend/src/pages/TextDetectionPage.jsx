import React, { useState } from 'react';
import {
  Box, Container, Typography, TextField, Button, CircularProgress, Alert, Paper, Grid,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { detectText } from '../services/api';
import ResultsCard from '../components/ResultsCard';
import TextHighlighter from '../components/TextHighlighter';

export default function TextDetectionPage() {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!text.trim() || text.trim().length < 10) {
      setError('Please enter at least 10 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await detectText(text, title);
      console.log('Detection response:', response);
      if (response && response.prediction) {
        setResult(response);
      } else {
        setError('Unexpected response from server. Please try again.');
      }
    } catch (err) {
      console.error('Detection error:', err);
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map(d => d.msg).join('; '));
      } else {
        setError(detail || err.message || 'Detection failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, animation: 'fadeIn 0.5s ease-out' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#f1f5f9', mb: 1 }}>
          📝 Fake News Detection
        </Typography>
        <Typography variant="body1" sx={{ color: '#94a3b8' }}>
          Paste a news article or text to analyze for fake content using our DistilBERT NLP model.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Input */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              background: 'rgba(17, 24, 39, 0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
            }}
          >
            <TextField
              id="text-title-input"
              label="Article Title (optional)"
              variant="outlined"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  color: '#f1f5f9',
                  '& fieldset': { borderColor: 'rgba(148,163,184,0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(6,214,160,0.4)' },
                  '&.Mui-focused fieldset': { borderColor: '#06d6a0' },
                },
                '& .MuiInputLabel-root': { color: '#64748b' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#06d6a0' },
              }}
            />

            <TextField
              id="text-content-input"
              label="Article / News Text"
              variant="outlined"
              fullWidth
              multiline
              rows={12}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your news article or text here..."
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  color: '#f1f5f9',
                  fontFamily: 'Inter, sans-serif',
                  lineHeight: 1.7,
                  '& fieldset': { borderColor: 'rgba(148,163,184,0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(6,214,160,0.4)' },
                  '&.Mui-focused fieldset': { borderColor: '#06d6a0' },
                },
                '& .MuiInputLabel-root': { color: '#64748b' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#06d6a0' },
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                {text.length} characters
              </Typography>
              <Button
                id="analyze-text-btn"
                variant="contained"
                endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                onClick={handleSubmit}
                disabled={loading || text.trim().length < 10}
                sx={{
                  px: 4,
                  py: 1.2,
                  background: 'linear-gradient(135deg, #06d6a0, #118ab2)',
                  borderRadius: 3,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  '&:hover': { background: 'linear-gradient(135deg, #05c795, #0f7a9e)' },
                  '&:disabled': { opacity: 0.5 },
                }}
              >
                {loading ? 'Analyzing...' : 'Analyze Text'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Results */}
        <Grid item xs={12} md={6}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {result && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, animation: 'slideUp 0.5s ease-out' }}>
              <ResultsCard result={result} type="TEXT" />

              {/* Web Search Summary */}
              {result.web_search_summary && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: 'rgba(17, 24, 39, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#f1f5f9', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    🌐 Live Internet Cross-Reference
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#cbd5e1', lineHeight: 1.6 }}>
                    {result.web_search_summary}
                  </Typography>

                  {/* Top Source Box */}
                  {result.source_link && (
                    <Box sx={{ 
                      mt: 3, 
                      p: 2, 
                      borderRadius: 2, 
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      borderLeft: '4px solid #3b82f6'
                    }}>
                      <Typography variant="subtitle2" sx={{ color: '#60a5fa', fontWeight: 700, mb: 0.5, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                        Top Article Source
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#f8fafc', fontWeight: 600, mb: 1 }}>
                        {result.source_title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic', mb: 2, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                        "{result.source_snippet}"
                      </Typography>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        href={result.source_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        sx={{ 
                          textTransform: 'none', 
                          borderColor: 'rgba(59, 130, 246, 0.5)',
                          color: '#60a5fa',
                          '&:hover': {
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)'
                          }
                        }}
                      >
                        Read Full Source
                      </Button>
                    </Box>
                  )}
                </Paper>
              )}

              {/* Attention weights */}
              {result.attention_weights && result.attention_weights.length > 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: 'rgba(17, 24, 39, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#f1f5f9', mb: 2 }}>
                    🧠 Attention Weights (Explainable AI)
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {result.attention_weights.map((item, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1.5,
                          backgroundColor: `rgba(131, 56, 236, ${Math.min(item.weight * 3, 0.4)})`,
                          border: `1px solid rgba(131, 56, 236, ${Math.min(item.weight * 5, 0.6)})`,
                          fontSize: '0.8rem',
                          color: '#e2e8f0',
                          fontFamily: 'monospace',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            backgroundColor: `rgba(131, 56, 236, ${Math.min(item.weight * 5, 0.6)})`,
                          },
                        }}
                        title={`Weight: ${item.weight}`}
                      >
                        {item.token}
                        <Typography
                          component="span"
                          sx={{ ml: 0.5, fontSize: '0.65rem', color: '#a78bfa' }}
                        >
                          {(item.weight * 100).toFixed(0)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              )}

              <TextHighlighter sentences={result.highlighted_sentences} />
            </Box>
          )}

          {!result && !error && !loading && (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 300,
              borderRadius: 3,
              border: '1px dashed rgba(148, 163, 184, 0.15)',
              background: 'rgba(17, 24, 39, 0.3)',
            }}>
              <Typography variant="h1" sx={{ fontSize: '3rem', mb: 1 }}>📰</Typography>
              <Typography variant="body1" sx={{ color: '#64748b' }}>
                Enter text and click "Analyze" to see results
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
