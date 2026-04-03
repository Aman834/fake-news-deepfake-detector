import React from 'react';
import { Box, Typography, Paper, IconButton, AppBar, Toolbar, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ShieldIcon from '@mui/icons-material/Shield';
import HomeIcon from '@mui/icons-material/Home';
import ArticleIcon from '@mui/icons-material/Article';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import VideocamIcon from '@mui/icons-material/Videocam';
import DashboardIcon from '@mui/icons-material/Dashboard';

const navItems = [
  { label: 'Home', path: '/', icon: <HomeIcon /> },
  { label: 'Text', path: '/detect/text', icon: <ArticleIcon /> },
  { label: 'Image', path: '/detect/image', icon: <ImageIcon /> },
  { label: 'Video', path: '/detect/video', icon: <VideoLibraryIcon /> },
  { label: 'Webcam', path: '/detect/webcam', icon: <VideocamIcon /> },
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'rgba(10, 14, 23, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
      }}
    >
      <Toolbar sx={{ maxWidth: 1400, width: '100%', mx: 'auto', px: { xs: 2, md: 3 } }}>
        {/* Logo */}
        <Box
          onClick={() => navigate('/')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            mr: 4,
            '&:hover': { opacity: 0.9 },
          }}
        >
          <ShieldIcon sx={{ 
            fontSize: 32, 
            background: 'linear-gradient(135deg, #06d6a0, #118ab2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #06d6a0 0%, #118ab2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            DeepGuard AI
          </Typography>
        </Box>

        {/* Navigation */}
        <Box sx={{ display: 'flex', gap: 0.5, flex: 1, justifyContent: 'center' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                startIcon={item.icon}
                sx={{
                  color: isActive ? '#06d6a0' : '#94a3b8',
                  fontWeight: isActive ? 700 : 500,
                  textTransform: 'none',
                  px: { xs: 1, md: 2 },
                  py: 1,
                  borderRadius: 2,
                  fontSize: { xs: '0.75rem', md: '0.85rem' },
                  backgroundColor: isActive ? 'rgba(6, 214, 160, 0.08)' : 'transparent',
                  transition: 'all 0.2s ease',
                  '& .MuiButton-startIcon': {
                    mr: { xs: 0, md: 1 },
                  },
                  '& .MuiButton-startIcon > svg': {
                    fontSize: { xs: 18, md: 20 },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(6, 214, 160, 0.05)',
                    color: '#06d6a0',
                  },
                }}
              >
                <Box sx={{ display: { xs: 'none', lg: 'inline' } }}>{item.label}</Box>
              </Button>
            );
          })}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
