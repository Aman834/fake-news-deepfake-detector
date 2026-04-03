import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

export default function ConfidenceMeter({ value, size = 140, label, prediction }) {
  const normalizedValue = Math.min(Math.max(value || 0, 0), 1);
  const percentage = Math.round(normalizedValue * 100);
  
  // Color based on value
  const getColor = (val) => {
    if (val >= 0.8) return '#ef4444'; // High danger
    if (val >= 0.6) return '#f59e0b'; // Warning
    if (val >= 0.4) return '#fb5607'; // Medium
    return '#06d6a0'; // Safe
  };
  
  const color = getColor(normalizedValue);
  const isFake = prediction === 'Fake' || prediction === 'Deepfake' || prediction === 'Manipulated';

  return (
    <Box
      id="confidence-meter"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        {/* Background circle */}
        <CircularProgress
          variant="determinate"
          value={100}
          size={size}
          thickness={4}
          sx={{ color: 'rgba(148, 163, 184, 0.1)', position: 'absolute' }}
        />
        {/* Value circle */}
        <CircularProgress
          variant="determinate"
          value={percentage}
          size={size}
          thickness={4}
          sx={{
            color: color,
            filter: `drop-shadow(0 0 8px ${color}60)`,
            transition: 'all 1s ease-out',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
              transition: 'stroke-dashoffset 1s ease-out',
            },
          }}
        />
        {/* Center text */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: color,
              fontSize: size * 0.2,
              lineHeight: 1,
              textShadow: `0 0 10px ${color}40`,
            }}
          >
            {percentage}%
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: '#94a3b8', fontSize: size * 0.08, mt: 0.3 }}
          >
            confidence
          </Typography>
        </Box>
      </Box>
      
      {prediction && (
        <Box
          sx={{
            px: 2.5,
            py: 0.8,
            borderRadius: 10,
            background: isFake
              ? 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(255,0,110,0.15))'
              : 'linear-gradient(135deg, rgba(6,214,160,0.15), rgba(17,138,178,0.15))',
            border: `1px solid ${isFake ? 'rgba(239,68,68,0.3)' : 'rgba(6,214,160,0.3)'}`,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: isFake ? '#ef4444' : '#06d6a0',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              fontSize: '0.8rem',
            }}
          >
            {prediction}
          </Typography>
        </Box>
      )}
      
      {label && (
        <Typography variant="caption" sx={{ color: '#64748b' }}>
          {label}
        </Typography>
      )}
    </Box>
  );
}
