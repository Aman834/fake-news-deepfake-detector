import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Paper, Chip, CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { getHistory, healthCheck } from '../services/api';

export default function DashboardPage() {
  const [history, setHistory] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyData, healthData] = await Promise.allSettled([
          getHistory(20),
          healthCheck(),
        ]);
        if (historyData.status === 'fulfilled') setHistory(historyData.value.history || []);
        if (healthData.status === 'fulfilled') setHealth(healthData.value);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute stats
  const totalDetections = history.length;
  const fakeCount = history.filter(h =>
    h.prediction === 'Fake' || h.prediction === 'Deepfake' || h.prediction === 'Manipulated'
  ).length;
  const avgConfidence = history.length
    ? (history.reduce((sum, h) => sum + (h.confidence || 0), 0) / history.length * 100).toFixed(1)
    : '0.0';

  const stats = [
    { label: 'Total Scans', value: totalDetections, color: '#118ab2', icon: <TrendingUpIcon /> },
    { label: 'Threats Found', value: fakeCount, color: '#ef4444', icon: <ErrorIcon /> },
    { label: 'Clean Results', value: totalDetections - fakeCount, color: '#06d6a0', icon: <CheckCircleIcon /> },
    { label: 'Avg Confidence', value: `${avgConfidence}%`, color: '#8338ec', icon: <WarningIcon /> },
  ];

  const getTypeColor = (type) => {
    const colors = { text: '#06d6a0', image: '#118ab2', video: '#8338ec', webcam: '#ff006e' };
    return colors[type] || '#94a3b8';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, animation: 'fadeIn 0.5s ease-out' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#f1f5f9', mb: 1 }}>
          📊 Detection Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: '#94a3b8' }}>
          Overview of detection history and system status.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#06d6a0' }} />
        </Box>
      ) : (
        <>
          {/* System health */}
          {health && (
            <Paper
              elevation={0}
              sx={{
                p: 2, mb: 4, borderRadius: 3,
                background: 'rgba(6, 214, 160, 0.05)',
                border: '1px solid rgba(6, 214, 160, 0.15)',
                display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap',
              }}
            >
              <Chip
                icon={<CheckCircleIcon />}
                label={`System: ${health.status}`}
                sx={{
                  backgroundColor: 'rgba(6, 214, 160, 0.1)',
                  color: '#06d6a0',
                  fontWeight: 700,
                }}
              />
              <Chip
                label={`Models: ${health.models_loaded ? 'Loaded' : 'Loading...'}`}
                size="small"
                sx={{ backgroundColor: 'rgba(148,163,184,0.1)', color: '#94a3b8' }}
              />
              <Chip
                label={`DB: ${health.database_connected ? 'Connected' : 'Offline'}`}
                size="small"
                sx={{
                  backgroundColor: health.database_connected
                    ? 'rgba(6,214,160,0.1)'
                    : 'rgba(245,158,11,0.1)',
                  color: health.database_connected ? '#06d6a0' : '#f59e0b',
                }}
              />
              <Typography variant="caption" sx={{ color: '#64748b', ml: 'auto' }}>
                v{health.version}
              </Typography>
            </Paper>
          )}

          {/* Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {stats.map((stat, idx) => (
              <Grid item xs={6} md={3} key={idx}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3, borderRadius: 3, textAlign: 'center',
                    background: 'rgba(17, 24, 39, 0.5)',
                    backdropFilter: 'blur(12px)',
                    border: `1px solid ${stat.color}15`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      border: `1px solid ${stat.color}30`,
                      boxShadow: `0 4px 20px ${stat.color}10`,
                    },
                  }}
                >
                  <Box sx={{ color: stat.color, mb: 1, '& svg': { fontSize: 28 } }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: stat.color }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* History */}
          <Paper
            elevation={0}
            sx={{
              p: 3, borderRadius: 3,
              background: 'rgba(17, 24, 39, 0.5)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(148, 163, 184, 0.08)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#f1f5f9', mb: 2 }}>
              Recent Detections
            </Typography>

            {history.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" sx={{ color: '#64748b' }}>
                  No detection history yet. Start analyzing content to see results here.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {history.map((item, idx) => {
                  const isFake = item.prediction === 'Fake' || item.prediction === 'Deepfake' || item.prediction === 'Manipulated';
                  return (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 2,
                        p: 2, borderRadius: 2,
                        backgroundColor: 'rgba(148, 163, 184, 0.03)',
                        border: '1px solid rgba(148, 163, 184, 0.05)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(148, 163, 184, 0.06)',
                        },
                      }}
                    >
                      {isFake ? (
                        <ErrorIcon sx={{ color: '#ef4444', fontSize: 20 }} />
                      ) : (
                        <CheckCircleIcon sx={{ color: '#06d6a0', fontSize: 20 }} />
                      )}

                      <Chip
                        label={item.detection_type || 'unknown'}
                        size="small"
                        sx={{
                          backgroundColor: `${getTypeColor(item.detection_type)}15`,
                          color: getTypeColor(item.detection_type),
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          textTransform: 'uppercase',
                          minWidth: 65,
                        }}
                      />

                      <Typography variant="body2" sx={{ color: '#f1f5f9', fontWeight: 600, flex: 1 }}>
                        {item.prediction}
                      </Typography>

                      <Typography variant="body2" sx={{ color: '#94a3b8', fontFamily: 'monospace' }}>
                        {((item.confidence || 0) * 100).toFixed(1)}%
                      </Typography>

                      <Typography variant="caption" sx={{ color: '#64748b', minWidth: 120, textAlign: 'right' }}>
                        {item.created_at ? new Date(item.created_at).toLocaleString() : '—'}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>
        </>
      )}
    </Container>
  );
}
