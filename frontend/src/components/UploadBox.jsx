import React, { useState, useCallback } from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';

export default function UploadBox({ accept, onFileSelect, label, icon, maxSize = '100MB' }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleChange = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    onFileSelect(null);
  }, [onFileSelect]);

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Paper
      id="upload-box"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      sx={{
        p: 4,
        textAlign: 'center',
        cursor: 'pointer',
        borderRadius: 3,
        border: '2px dashed',
        borderColor: dragActive ? 'primary.main' : 'rgba(148, 163, 184, 0.2)',
        backgroundColor: dragActive 
          ? 'rgba(6, 214, 160, 0.05)'
          : 'rgba(17, 24, 39, 0.5)',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: 'primary.main',
          backgroundColor: 'rgba(6, 214, 160, 0.03)',
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 32px rgba(6, 214, 160, 0.1)',
        },
      }}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        style={{ display: 'none' }}
        id="file-upload-input"
      />
      
      {selectedFile ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <InsertDriveFileIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#f1f5f9' }}>
              {selectedFile.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              {formatSize(selectedFile.size)}
            </Typography>
          </Box>
          <IconButton onClick={clearFile} sx={{ color: '#ef4444' }}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ) : (
        <label htmlFor="file-upload-input" style={{ cursor: 'pointer', display: 'block' }}>
          <Box sx={{ mb: 2 }}>
            {icon || <CloudUploadIcon sx={{ fontSize: 56, color: '#06d6a0', opacity: 0.8 }} />}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#f1f5f9' }}>
            {label || 'Drop file here or click to upload'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Max size: {maxSize} • Drag & drop supported
          </Typography>
        </label>
      )}
    </Paper>
  );
}
