import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Box, Typography, Button, Paper, Chip } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import FaceIcon from '@mui/icons-material/Face';
import ShieldIcon from '@mui/icons-material/Shield';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import useWebSocket from '../hooks/useWebSocket';

export default function WebcamStream() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);       // Hidden canvas for frame capture
  const overlayRef = useRef(null);      // Visible canvas for face boxes
  const intervalRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [latestResult, setLatestResult] = useState(null);
  const [frameCount, setFrameCount] = useState(0);
  const [fps, setFps] = useState(0);
  const fpsRef = useRef({ count: 0, lastTime: Date.now() });

  const { isConnected, lastMessage, error, connect, disconnect, sendMessage } = useWebSocket('/ws/webcam');

  // Handle incoming results and draw face overlays
  useEffect(() => {
    if (lastMessage) {
      setLatestResult(lastMessage);
      setFrameCount(lastMessage.frame || 0);

      // Calculate FPS
      fpsRef.current.count++;
      const now = Date.now();
      if (now - fpsRef.current.lastTime >= 1000) {
        setFps(fpsRef.current.count);
        fpsRef.current.count = 0;
        fpsRef.current.lastTime = now;
      }

      // Draw face bounding boxes on overlay canvas
      drawFaceOverlay(lastMessage);
    }
  }, [lastMessage]);

  const drawFaceOverlay = useCallback((result) => {
    const overlay = overlayRef.current;
    const video = videoRef.current;
    if (!overlay || !video) return;

    const ctx = overlay.getContext('2d');
    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;

    overlay.width = overlay.clientWidth;
    overlay.height = overlay.clientHeight;

    ctx.clearRect(0, 0, overlay.width, overlay.height);

    const faces = result.face_locations || [];
    const isFake = result.prediction === 'Deepfake';
    const confidence = result.confidence || 0;

    // Scale factors: face coords are from the 320x240 CAPTURED frame, not the video element
    const captureW = 320;
    const captureH = 240;
    const scaleX = overlay.width / captureW;
    const scaleY = overlay.height / captureH;

    faces.forEach((face, i) => {
      const [fx, fy, fw, fh] = face.bbox;

      // Mirror X since video is flipped
      const x = overlay.width - (fx + fw) * scaleX;
      const y = fy * scaleY;
      const w = fw * scaleX;
      const h = fh * scaleY;

      // Bounding box
      ctx.strokeStyle = isFake ? '#ef4444' : '#06d6a0';
      ctx.lineWidth = 3;
      ctx.shadowColor = isFake ? '#ef4444' : '#06d6a0';
      ctx.shadowBlur = 8;
      ctx.strokeRect(x, y, w, h);

      // Corner accents
      const cornerLen = Math.min(w, h) * 0.2;
      ctx.lineWidth = 4;
      ctx.shadowBlur = 12;

      // Top-left
      ctx.beginPath();
      ctx.moveTo(x, y + cornerLen);
      ctx.lineTo(x, y);
      ctx.lineTo(x + cornerLen, y);
      ctx.stroke();

      // Top-right
      ctx.beginPath();
      ctx.moveTo(x + w - cornerLen, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + cornerLen);
      ctx.stroke();

      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(x, y + h - cornerLen);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x + cornerLen, y + h);
      ctx.stroke();

      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(x + w - cornerLen, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w, y + h - cornerLen);
      ctx.stroke();

      ctx.shadowBlur = 0;

      // Label background
      const label = isFake
        ? `FAKE ${(confidence * 100).toFixed(0)}%`
        : `REAL ${(confidence * 100).toFixed(0)}%`;
      ctx.font = 'bold 14px Inter, sans-serif';
      const textWidth = ctx.measureText(label).width;
      const labelX = x;
      const labelY = y - 8;

      ctx.fillStyle = isFake ? 'rgba(239,68,68,0.85)' : 'rgba(6,214,160,0.85)';
      ctx.beginPath();
      ctx.roundRect(labelX - 4, labelY - 16, textWidth + 12, 22, 4);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, labelX + 2, labelY);
    });
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraReady(true);
      }
    } catch (err) {
      console.error('Camera access denied:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
    if (overlayRef.current) {
      const ctx = overlayRef.current.getContext('2d');
      ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
    }
  }, []);

  const startStreaming = useCallback(() => {
    connect();
    setStreaming(true);
    setLatestResult(null);
    fpsRef.current = { count: 0, lastTime: Date.now() };

    // Capture and send frames every 500ms
    intervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = 320;
        canvas.height = 240;
        ctx.drawImage(videoRef.current, 0, 0, 320, 240);

        const frame = canvas.toDataURL('image/jpeg', 0.7);
        sendMessage({ frame });
      }
    }, 500);
  }, [connect, sendMessage]);

  const stopStreaming = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    disconnect();
    setStreaming(false);
    setLatestResult(null);
    setFps(0);
    if (overlayRef.current) {
      const ctx = overlayRef.current.getContext('2d');
      ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
    }
  }, [disconnect]);

  useEffect(() => {
    return () => {
      stopStreaming();
      stopCamera();
    };
  }, []);

  const isFake = latestResult?.prediction === 'Deepfake';
  const isNoFace = latestResult?.prediction === 'No Face';
  const deepfakeProb = latestResult?.deepfake_probability || 0;
  const realProb = latestResult?.real_probability || 0;

  return (
    <Box id="webcam-stream" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Video feed with face overlay */}
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          borderRadius: 3,
          overflow: 'hidden',
          backgroundColor: '#000',
          aspectRatio: '4/3',
          maxHeight: 480,
          border: `2px solid ${
            streaming
              ? (isFake ? 'rgba(239,68,68,0.6)' : isNoFace ? 'rgba(148,163,184,0.3)' : 'rgba(6,214,160,0.6)')
              : 'rgba(148, 163, 184, 0.1)'
          }`,
          transition: 'border-color 0.3s ease',
          boxShadow: streaming && !isNoFace
            ? (isFake ? '0 0 30px rgba(239,68,68,0.15)' : '0 0 30px rgba(6,214,160,0.15)')
            : 'none',
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)',
          }}
        />
        {/* Face bounding box overlay */}
        <canvas
          ref={overlayRef}
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        />
        {/* Hidden canvas for frame capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Live overlay elements */}
        {streaming && (
          <>
            {/* Recording indicator */}
            <Box sx={{
              position: 'absolute', top: 16, left: 16,
              display: 'flex', alignItems: 'center', gap: 0.5,
              px: 1.5, py: 0.5, borderRadius: 10,
              backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
            }}>
              <FiberManualRecordIcon sx={{ fontSize: 12, color: '#ef4444', animation: 'pulse 1s infinite' }} />
              <Typography variant="caption" sx={{ color: '#fff', fontWeight: 600 }}>LIVE</Typography>
              {fps > 0 && (
                <Typography variant="caption" sx={{ color: '#94a3b8', ml: 0.5 }}>
                  {fps} FPS
                </Typography>
              )}
            </Box>

            {/* Real-time verdict overlay */}
            {latestResult && !isNoFace && (
              <Box sx={{
                position: 'absolute', top: 16, right: 16,
                px: 2, py: 1, borderRadius: 2,
                backgroundColor: isFake ? 'rgba(239,68,68,0.85)' : 'rgba(6,214,160,0.85)',
                backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', gap: 1,
              }}>
                {isFake
                  ? <WarningAmberIcon sx={{ fontSize: 18, color: '#fff' }} />
                  : <ShieldIcon sx={{ fontSize: 18, color: '#fff' }} />
                }
                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700 }}>
                  {isFake ? 'DEEPFAKE' : 'REAL PERSON'}
                </Typography>
              </Box>
            )}

            {/* No face indicator */}
            {latestResult && isNoFace && (
              <Box sx={{
                position: 'absolute', top: 16, right: 16,
                px: 2, py: 1, borderRadius: 2,
                backgroundColor: 'rgba(100,116,139,0.7)',
                backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', gap: 1,
              }}>
                <FaceIcon sx={{ fontSize: 18, color: '#fff' }} />
                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                  No face detected
                </Typography>
              </Box>
            )}

            {/* Frame counter & faces */}
            <Box sx={{
              position: 'absolute', bottom: 16, left: 16,
              px: 1.5, py: 0.5, borderRadius: 1,
              backgroundColor: 'rgba(0,0,0,0.6)',
              display: 'flex', gap: 2,
            }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontFamily: 'monospace' }}>
                Frame: {frameCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontFamily: 'monospace' }}>
                Faces: {latestResult?.faces_detected || 0}
              </Typography>
            </Box>
          </>
        )}

        {/* Placeholder when no camera */}
        {!cameraReady && (
          <Box sx={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(10, 14, 23, 0.95)',
          }}>
            <VideocamOffIcon sx={{ fontSize: 64, color: '#64748b', mb: 2 }} />
            <Typography variant="body1" sx={{ color: '#94a3b8' }}>
              Camera not active
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Controls */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        {!cameraReady ? (
          <Button
            variant="contained"
            startIcon={<VideocamIcon />}
            onClick={startCamera}
            sx={{
              px: 4, py: 1.5,
              background: 'linear-gradient(135deg, #06d6a0, #118ab2)',
              borderRadius: 3,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '1rem',
              '&:hover': { background: 'linear-gradient(135deg, #05c795, #0f7a9e)' },
            }}
          >
            Start Camera
          </Button>
        ) : (
          <>
            {!streaming ? (
              <Button
                variant="contained"
                onClick={startStreaming}
                startIcon={<ShieldIcon />}
                sx={{
                  px: 4, py: 1.5,
                  background: 'linear-gradient(135deg, #8338ec, #118ab2)',
                  borderRadius: 3,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '1rem',
                  '&:hover': { background: 'linear-gradient(135deg, #7028d4, #0f7a9e)' },
                }}
              >
                Start Detection
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={stopStreaming}
                sx={{
                  px: 4, py: 1.5,
                  background: 'linear-gradient(135deg, #ef4444, #ff006e)',
                  borderRadius: 3,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '1rem',
                }}
              >
                Stop Detection
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<VideocamOffIcon />}
              onClick={() => { stopStreaming(); stopCamera(); }}
              sx={{
                px: 3, py: 1.5,
                borderColor: 'rgba(148,163,184,0.3)',
                color: '#94a3b8',
                borderRadius: 3,
                textTransform: 'none',
                '&:hover': { borderColor: '#ef4444', color: '#ef4444' },
              }}
            >
              Stop Camera
            </Button>
          </>
        )}
      </Box>

      {/* Real-time analysis panel */}
      {streaming && latestResult && !isNoFace && (
        <Paper elevation={0} sx={{
          p: 3, borderRadius: 3,
          background: isFake
            ? 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(255,0,110,0.05))'
            : 'linear-gradient(135deg, rgba(6,214,160,0.08), rgba(17,138,178,0.05))',
          border: `1px solid ${isFake ? 'rgba(239,68,68,0.2)' : 'rgba(6,214,160,0.2)'}`,
          animation: 'fadeIn 0.3s ease',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isFake
                ? <WarningAmberIcon sx={{ color: '#ef4444', fontSize: 28 }} />
                : <ShieldIcon sx={{ color: '#06d6a0', fontSize: 28 }} />
              }
              <Typography variant="h6" sx={{
                fontWeight: 800,
                color: isFake ? '#ef4444' : '#06d6a0',
              }}>
                {isFake ? 'Deepfake Detected' : 'Real Person Verified'}
              </Typography>
            </Box>
            <Chip
              label={`${(latestResult.confidence * 100).toFixed(0)}% confidence`}
              sx={{
                background: isFake ? 'rgba(239,68,68,0.15)' : 'rgba(6,214,160,0.15)',
                color: isFake ? '#ef4444' : '#06d6a0',
                fontWeight: 700,
              }}
            />
          </Box>

          {/* Probability bars */}
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                  Real
                </Typography>
                <Typography variant="caption" sx={{ color: '#06d6a0', fontWeight: 700 }}>
                  {(realProb * 100).toFixed(1)}%
                </Typography>
              </Box>
              <Box sx={{
                height: 8, borderRadius: 4,
                background: 'rgba(148,163,184,0.1)',
                overflow: 'hidden',
              }}>
                <Box sx={{
                  height: '100%',
                  width: `${realProb * 100}%`,
                  borderRadius: 4,
                  background: 'linear-gradient(90deg, #06d6a0, #118ab2)',
                  transition: 'width 0.3s ease',
                }} />
              </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                  Deepfake
                </Typography>
                <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 700 }}>
                  {(deepfakeProb * 100).toFixed(1)}%
                </Typography>
              </Box>
              <Box sx={{
                height: 8, borderRadius: 4,
                background: 'rgba(148,163,184,0.1)',
                overflow: 'hidden',
              }}>
                <Box sx={{
                  height: '100%',
                  width: `${deepfakeProb * 100}%`,
                  borderRadius: 4,
                  background: 'linear-gradient(90deg, #ef4444, #ff006e)',
                  transition: 'width 0.3s ease',
                }} />
              </Box>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Connection status */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
        <Chip
          size="small"
          label={isConnected ? 'Connected' : 'Disconnected'}
          sx={{
            backgroundColor: isConnected ? 'rgba(6,214,160,0.1)' : 'rgba(148,163,184,0.1)',
            color: isConnected ? '#06d6a0' : '#64748b',
            fontWeight: 600,
            fontSize: '0.7rem',
          }}
        />
        {streaming && (
          <Chip
            size="small"
            label={`Model: forensic-face-analysis`}
            sx={{
              backgroundColor: 'rgba(131,56,236,0.1)',
              color: '#8338ec',
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />
        )}
        {error && (
          <Chip
            size="small"
            label={error}
            sx={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.7rem' }}
          />
        )}
      </Box>
    </Box>
  );
}
