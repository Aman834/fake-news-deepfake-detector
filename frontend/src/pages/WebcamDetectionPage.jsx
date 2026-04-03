import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import WebcamStream from '../components/WebcamStream';

export default function WebcamDetectionPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, animation: 'fadeIn 0.5s ease-out' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#f1f5f9', mb: 1 }}>
          📹 Real-Time Webcam Detection
        </Typography>
        <Typography variant="body1" sx={{ color: '#94a3b8', mb: 3 }}>
          Stream your webcam to detect deepfakes in real time. Powered by WebSocket for low-latency inference.
        </Typography>

        {/* Instructions */}
        <Box sx={{
          p: 2, borderRadius: 2, mb: 3,
          background: 'rgba(17, 138, 178, 0.08)',
          border: '1px solid rgba(17, 138, 178, 0.2)',
        }}>
          <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.8 }}>
            <strong style={{ color: '#118ab2' }}>How it works:</strong> Start your camera, then click
            "Start Detection" to begin streaming frames to the AI model every 500ms. Results appear
            as an overlay on the video feed in real time.
          </Typography>
        </Box>
      </Box>

      <WebcamStream />
    </Container>
  );
}
