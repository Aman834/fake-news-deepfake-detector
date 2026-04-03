import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export default function VideoAnalyzer({ result }) {
  if (!result || !result.frame_scores) return null;

  const maxScore = Math.max(...result.frame_scores);
  const fakeFrames = result.fake_frames || [];

  return (
    <Paper
      id="video-analyzer"
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
        🎬 Frame-Level Analysis
      </Typography>

      {/* Stats row */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Frames', value: result.total_frames_analyzed, color: '#118ab2' },
          { label: 'Fake Frames', value: result.fake_frame_count, color: '#ef4444' },
          { label: 'Max Score', value: `${(maxScore * 100).toFixed(0)}%`, color: '#f59e0b' },
          { label: 'Fake Ratio', value: `${(result.analysis?.fake_frame_ratio * 100 || 0).toFixed(0)}%`, color: '#8338ec' },
        ].map((stat, idx) => (
          <Box
            key={idx}
            sx={{
              flex: '1 1 120px',
              p: 1.5,
              borderRadius: 2,
              backgroundColor: 'rgba(148, 163, 184, 0.05)',
              textAlign: 'center',
              border: `1px solid ${stat.color}20`,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 800, color: stat.color }}>
              {stat.value}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              {stat.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Frame score visualization */}
      <Typography variant="body2" sx={{ color: '#94a3b8', mb: 1.5 }}>
        Frame Scores Timeline
      </Typography>
      <Box
        sx={{
          display: 'flex',
          gap: '2px',
          height: 80,
          alignItems: 'flex-end',
          p: 1,
          borderRadius: 2,
          backgroundColor: 'rgba(0,0,0,0.2)',
          overflow: 'hidden',
        }}
      >
        {result.frame_scores.map((score, idx) => {
          const isFake = fakeFrames.includes(idx);
          return (
            <Box
              key={idx}
              title={`Frame ${idx}: ${(score * 100).toFixed(1)}%`}
              sx={{
                flex: 1,
                minWidth: 3,
                maxWidth: 12,
                height: `${Math.max(score * 100, 2)}%`,
                borderRadius: '2px 2px 0 0',
                background: isFake
                  ? 'linear-gradient(to top, #ef4444, #ff006e)'
                  : 'linear-gradient(to top, #06d6a0, #118ab2)',
                opacity: 0.85,
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                '&:hover': {
                  opacity: 1,
                  transform: 'scaleY(1.1)',
                  transformOrigin: 'bottom',
                },
              }}
            />
          );
        })}
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, mt: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#06d6a0' }} />
          <Typography variant="caption" sx={{ color: '#64748b' }}>Real</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444' }} />
          <Typography variant="caption" sx={{ color: '#64748b' }}>Deepfake</Typography>
        </Box>
      </Box>
    </Paper>
  );
}
