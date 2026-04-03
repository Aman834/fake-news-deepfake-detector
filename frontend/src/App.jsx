import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import TextDetectionPage from './pages/TextDetectionPage';
import ImageDetectionPage from './pages/ImageDetectionPage';
import VideoDetectionPage from './pages/VideoDetectionPage';
import WebcamDetectionPage from './pages/WebcamDetectionPage';
import DashboardPage from './pages/DashboardPage';

// MUI Theme - Dark cyber aesthetic
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#06d6a0' },
    secondary: { main: '#8338ec' },
    background: {
      default: '#0a0e17',
      paper: '#111827',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
    },
    error: { main: '#ef4444' },
    warning: { main: '#f59e0b' },
    success: { main: '#06d6a0' },
    info: { main: '#118ab2' },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: { fontWeight: 900, letterSpacing: '-0.03em' },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 800 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Box component="main" sx={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/detect/text" element={<TextDetectionPage />} />
              <Route path="/detect/image" element={<ImageDetectionPage />} />
              <Route path="/detect/video" element={<VideoDetectionPage />} />
              <Route path="/detect/webcam" element={<WebcamDetectionPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </Box>
          
          {/* Footer */}
          <Box
            component="footer"
            sx={{
              py: 3,
              textAlign: 'center',
              borderTop: '1px solid rgba(148, 163, 184, 0.06)',
              background: 'rgba(10, 14, 23, 0.8)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
              <Box sx={{
                width: 8, height: 8, borderRadius: '50%',
                background: 'linear-gradient(135deg, #06d6a0, #118ab2)',
              }} />
              <Box component="span" sx={{
                fontWeight: 700, fontSize: '0.85rem',
                background: 'linear-gradient(135deg, #06d6a0, #118ab2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                DeepGuard AI
              </Box>
            </Box>
            <Box component="span" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
              Real-Time Fake News & Deepfake Detection System • Powered by PyTorch & Transformers
            </Box>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}
