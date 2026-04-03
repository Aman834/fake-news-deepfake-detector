import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export default function TextHighlighter({ sentences }) {
  if (!sentences || sentences.length === 0) return null;

  return (
    <Paper
      id="text-highlighter"
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
        🔍 Suspicious Sentences
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {sentences.map((item, idx) => (
          <Box
            key={idx}
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: item.is_suspicious
                ? 'rgba(239, 68, 68, 0.08)'
                : 'rgba(245, 158, 11, 0.06)',
              borderLeft: `3px solid ${item.is_suspicious ? '#ef4444' : '#f59e0b'}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: item.is_suspicious
                  ? 'rgba(239, 68, 68, 0.12)'
                  : 'rgba(245, 158, 11, 0.1)',
                transform: 'translateX(4px)',
              },
            }}
          >
            <Typography variant="body2" sx={{ color: '#e2e8f0', mb: 1, lineHeight: 1.6 }}>
              "{item.sentence}"
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Suspicion: <strong style={{ color: item.suspicion_score > 0.6 ? '#ef4444' : '#f59e0b' }}>
                  {(item.suspicion_score * 100).toFixed(0)}%
                </strong>
              </Typography>
              
              {item.matched_patterns && item.matched_patterns.length > 0 && (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {item.matched_patterns.map((pattern, pIdx) => (
                    <Box
                      key={pIdx}
                      sx={{
                        px: 1,
                        py: 0.2,
                        borderRadius: 1,
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        backgroundColor: 'rgba(131, 56, 236, 0.15)',
                        color: '#a78bfa',
                        fontFamily: 'monospace',
                      }}
                    >
                      {pattern}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
