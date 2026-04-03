import React from 'react';
import { Box, Typography, Chip, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import ConfidenceMeter from './ConfidenceMeter';

export default function ResultsCard({ result, type }) {
  if (!result) return null;

  const isFake = result.prediction === 'Fake' || result.prediction === 'Deepfake' || result.prediction === 'Manipulated';

  const getStatusIcon = () => {
    if (isFake && result.confidence > 0.7) return <ErrorIcon sx={{ color: '#ef4444', fontSize: 28 }} />;
    if (isFake) return <WarningIcon sx={{ color: '#f59e0b', fontSize: 28 }} />;
    return <CheckCircleIcon sx={{ color: '#06d6a0', fontSize: 28 }} />;
  };

  return (
    <Paper
      id="results-card"
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        background: 'rgba(17, 24, 39, 0.6)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${isFake ? 'rgba(239,68,68,0.2)' : 'rgba(6,214,160,0.2)'}`,
        animation: 'fadeIn 0.5s ease-out',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        {getStatusIcon()}
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#f1f5f9', flex: 1 }}>
          Detection Result
        </Typography>
        <Chip
          label={type}
          size="small"
          sx={{
            backgroundColor: 'rgba(131, 56, 236, 0.15)',
            color: '#a78bfa',
            fontWeight: 600,
            textTransform: 'uppercase',
            fontSize: '0.7rem',
            letterSpacing: '0.05em',
          }}
        />
      </Box>

      {/* Confidence meter */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <ConfidenceMeter
          value={result.confidence}
          prediction={result.prediction}
        />
      </Box>

      {/* Model info */}
      {result.model && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 1.5,
          borderRadius: 2,
          backgroundColor: 'rgba(148, 163, 184, 0.05)',
          mb: 2,
        }}>
          <Typography variant="caption" sx={{ color: '#64748b' }}>Model</Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, fontFamily: 'monospace' }}>
            {result.model}
          </Typography>
        </Box>
      )}

      {/* Additional scores */}
      {(result.fake_probability !== undefined || result.deepfake_probability !== undefined || result.manipulated_probability !== undefined) && (
        <Box sx={{ mt: 2 }}>
          {[
            { label: 'Fake Probability', value: result.fake_probability },
            { label: 'Deepfake Probability', value: result.deepfake_probability },
            { label: 'Manipulated Probability', value: result.manipulated_probability },
            { label: 'Authentic Probability', value: result.real_probability || result.authentic_probability },
          ].filter(s => s.value !== undefined).map((score, idx) => (
            <Box key={idx} sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>{score.label}</Typography>
                <Typography variant="caption" sx={{ color: '#f1f5f9', fontWeight: 600 }}>
                  {(score.value * 100).toFixed(1)}%
                </Typography>
              </Box>
              <Box sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(148, 163, 184, 0.1)',
                overflow: 'hidden',
              }}>
                <Box sx={{
                  height: '100%',
                  width: `${score.value * 100}%`,
                  borderRadius: 3,
                  background: score.value > 0.5
                    ? 'linear-gradient(90deg, #ef4444, #ff006e)'
                    : 'linear-gradient(90deg, #06d6a0, #118ab2)',
                  transition: 'width 1s ease-out',
                }} />
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
}
