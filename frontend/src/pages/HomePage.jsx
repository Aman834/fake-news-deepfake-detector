import React from 'react';
import { Box, Typography, Button, Container, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArticleIcon from '@mui/icons-material/Article';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import VideocamIcon from '@mui/icons-material/Videocam';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import PsychologyIcon from '@mui/icons-material/Psychology';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const detectionCards = [
  {
    title: 'Fake News Detection',
    description: 'Analyze articles and text using advanced NLP with DistilBERT transformer. Get sentence-level explainability.',
    path: '/detect/text',
    icon: <ArticleIcon sx={{ fontSize: 42 }} />,
    gradient: 'linear-gradient(135deg, #06d6a0, #118ab2)',
    glow: 'rgba(6, 214, 160, 0.15)',
  },
  {
    title: 'Image Analysis',
    description: 'Detect manipulated photos, GAN-generated faces, and deepfake images using EfficientNet CNN.',
    path: '/detect/image',
    icon: <ImageIcon sx={{ fontSize: 42 }} />,
    gradient: 'linear-gradient(135deg, #118ab2, #8338ec)',
    glow: 'rgba(17, 138, 178, 0.15)',
  },
  {
    title: 'Video Deepfake',
    description: 'Upload videos for frame-level deepfake detection with temporal aggregation and face tracking.',
    path: '/detect/video',
    icon: <VideoLibraryIcon sx={{ fontSize: 42 }} />,
    gradient: 'linear-gradient(135deg, #8338ec, #ff006e)',
    glow: 'rgba(131, 56, 236, 0.15)',
  },
  {
    title: 'Live Webcam',
    description: 'Real-time deepfake detection via webcam stream. WebSocket-powered low-latency inference.',
    path: '/detect/webcam',
    icon: <VideocamIcon sx={{ fontSize: 42 }} />,
    gradient: 'linear-gradient(135deg, #ff006e, #fb5607)',
    glow: 'rgba(255, 0, 110, 0.15)',
  },
];

const features = [
  { icon: <PsychologyIcon />, title: 'Explainable AI', desc: 'Understand why content is flagged with attention-based explanations' },
  { icon: <SpeedIcon />, title: 'Real-time Processing', desc: 'Sub-second inference on webcam streams via WebSocket' },
  { icon: <SecurityIcon />, title: 'Multi-modal Detection', desc: 'Analyze text, images, videos, and live streams in one platform' },
  { icon: <VerifiedUserIcon />, title: 'Confidence Scoring', desc: 'Weighted aggregation across multiple detection signals' },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: 'center',
          mb: 8,
          animation: 'slideUp 0.8s ease-out',
        }}
      >
        <Box sx={{
          display: 'inline-flex',
          px: 2, py: 0.5, mb: 3,
          borderRadius: 10,
          backgroundColor: 'rgba(6, 214, 160, 0.08)',
          border: '1px solid rgba(6, 214, 160, 0.2)',
        }}>
          <Typography variant="caption" sx={{ color: '#06d6a0', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            AI-Powered Verification System
          </Typography>
        </Box>
        
        <Typography
          variant="h1"
          sx={{
            fontWeight: 900,
            fontSize: { xs: '2rem', sm: '2.8rem', md: '3.5rem' },
            lineHeight: 1.1,
            mb: 3,
            letterSpacing: '-0.03em',
          }}
        >
          Detect{' '}
          <Box
            component="span"
            sx={{
              background: 'linear-gradient(135deg, #06d6a0 0%, #118ab2 40%, #8338ec 70%, #ff006e 100%)',
              backgroundSize: '200% 200%',
              animation: 'gradientFlow 4s ease infinite',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Fake News & Deepfakes
          </Box>
          {' '}in Real Time
        </Typography>
        
        <Typography
          variant="h6"
          sx={{
            color: '#94a3b8',
            fontWeight: 400,
            maxWidth: 700,
            mx: 'auto',
            lineHeight: 1.6,
            mb: 4,
          }}
        >
          Advanced deep learning models for detecting manipulated media, fake articles,
          and deepfake content — with explainable AI and confidence scoring.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/detect/text')}
            sx={{
              px: 4, py: 1.5,
              background: 'linear-gradient(135deg, #06d6a0, #118ab2)',
              borderRadius: 3,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '1.05rem',
              boxShadow: '0 4px 20px rgba(6, 214, 160, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #05c795, #0f7a9e)',
                boxShadow: '0 6px 28px rgba(6, 214, 160, 0.4)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Start Detecting
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/dashboard')}
            sx={{
              px: 4, py: 1.5,
              borderColor: 'rgba(148, 163, 184, 0.3)',
              color: '#94a3b8',
              borderRadius: 3,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1.05rem',
              '&:hover': {
                borderColor: '#06d6a0',
                color: '#06d6a0',
                backgroundColor: 'rgba(6, 214, 160, 0.05)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            View Dashboard
          </Button>
        </Box>
      </Box>

      {/* Detection Cards */}
      <Grid container spacing={3} sx={{ mb: 8 }}>
        {detectionCards.map((card, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Paper
              elevation={0}
              onClick={() => navigate(card.path)}
              sx={{
                p: 3,
                height: '100%',
                cursor: 'pointer',
                borderRadius: 4,
                background: 'rgba(17, 24, 39, 0.5)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(148, 163, 184, 0.08)',
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: `slideUp ${0.5 + idx * 0.1}s ease-out`,
                '&:hover': {
                  transform: 'translateY(-8px)',
                  border: '1px solid rgba(6, 214, 160, 0.2)',
                  boxShadow: `0 12px 40px ${card.glow}`,
                  background: 'rgba(17, 24, 39, 0.7)',
                },
              }}
            >
              <Box sx={{
                display: 'inline-flex',
                p: 1.5,
                borderRadius: 3,
                background: card.gradient,
                mb: 2,
                color: '#fff',
              }}>
                {card.icon}
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f1f5f9', mb: 1 }}>
                {card.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.6 }}>
                {card.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Features */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#f1f5f9', mb: 1 }}>
          Built for Trust
        </Typography>
        <Typography variant="body1" sx={{ color: '#94a3b8', mb: 4 }}>
          Enterprise-grade detection capabilities
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {features.map((feature, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Box sx={{
              textAlign: 'center',
              p: 3,
              borderRadius: 3,
              background: 'rgba(17, 24, 39, 0.3)',
              border: '1px solid rgba(148, 163, 184, 0.06)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(17, 24, 39, 0.5)',
                border: '1px solid rgba(148, 163, 184, 0.12)',
              },
            }}>
              <Box sx={{ color: '#06d6a0', mb: 1.5, '& svg': { fontSize: 36 } }}>
                {feature.icon}
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f1f5f9', mb: 0.5 }}>
                {feature.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.5 }}>
                {feature.desc}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
