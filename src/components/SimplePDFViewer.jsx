import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  IconButton,
  Button,
  CircularProgress
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  Download as DownloadIcon,
  Fullscreen as FullscreenIcon
} from '@mui/icons-material';

const SimplePDFViewer = ({ file, fileUrl }) => {
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfSupported, setPdfSupported] = useState(true);

  useEffect(() => {
    // Check if browser supports PDF viewing
    const checkPDFSupport = () => {
      const mimeTypes = navigator.mimeTypes;
      const hasAdobeReader = mimeTypes['application/pdf'] || mimeTypes['application/x-google-chrome-pdf'];
      setPdfSupported(!!hasAdobeReader);
    };
    
    checkPDFSupport();
  }, []);

  const zoomIn = () => {
    setScale(prev => Math.min(3.0, prev + 0.2));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.2));
  };

  const handleDownload = () => {
    if (!displayUrl) return;
    
    try {
      const link = document.createElement('a');
      link.href = displayUrl;
      link.download = file?.name || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
      setError('Download fehlgeschlagen');
    }
  };

  const openFullscreen = () => {
    if (!displayUrl) return;
    
    try {
      window.open(displayUrl, '_blank');
    } catch (err) {
      console.error('Fullscreen error:', err);
      setError('Vollbild-Anzeige fehlgeschlagen');
    }
  };

  // Bestimme die anzuzeigende URL
  const displayUrl = fileUrl || (file?.url ? file.url : null);

  // Prüfe ob es sich um eine Base64-kodierte PDF handelt
  const isBase64PDF = displayUrl && displayUrl.startsWith('data:application/pdf;base64,');
  
  if (!displayUrl) {
    return (
      <Alert severity="info">
        Keine PDF-URL verfügbar
      </Alert>
    );
  }

  if (!isBase64PDF) {
    return (
      <Alert severity="warning">
        Nur Base64-kodierte PDFs werden unterstützt. Externe URLs sind aus Sicherheitsgründen nicht erlaubt.
      </Alert>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={handleDownload}
          startIcon={<DownloadIcon />}
        >
          PDF herunterladen
        </Button>
      </Box>
    );
  }

  if (!pdfSupported) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Ihr Browser unterstützt keine PDF-Anzeige. Bitte laden Sie die Datei herunter.
        </Alert>
        <Button 
          variant="contained" 
          onClick={handleDownload}
          startIcon={<DownloadIcon />}
        >
          PDF herunterladen
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* Toolbar */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 1,
        borderBottom: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper'
      }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {file?.name || 'PDF Dokument'}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={zoomOut} disabled={scale <= 0.5} title="Verkleinern">
            <ZoomOut />
          </IconButton>
          <Typography variant="body2" sx={{ minWidth: '60px', textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </Typography>
          <IconButton onClick={zoomIn} disabled={scale >= 3.0} title="Vergrößern">
            <ZoomIn />
          </IconButton>
          
          <IconButton onClick={openFullscreen} title="Vollbild">
            <FullscreenIcon />
          </IconButton>
          
          <IconButton onClick={handleDownload} title="Herunterladen">
            <DownloadIcon />
          </IconButton>
        </Box>
      </Box>

      {/* PDF Content */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'flex-start',
        p: 2,
        backgroundColor: '#f5f5f5'
      }}>
        {loading && (
          <Box sx={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1
          }}>
            <CircularProgress />
          </Box>
        )}
        
        <Box sx={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          transition: 'transform 0.2s ease-in-out',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          backgroundColor: 'white',
          borderRadius: 1,
          position: 'relative'
        }}>
          <object
            data={displayUrl}
            type="application/pdf"
            width="800"
            height="1000"
            style={{
              border: 'none',
              display: 'block'
            }}
            onLoad={() => setLoading(false)}
            onError={() => {
              setError('PDF konnte nicht angezeigt werden');
              setLoading(false);
            }}
          >
            <embed
              src={displayUrl}
              type="application/pdf"
              width="800"
              height="1000"
              style={{
                border: 'none',
                display: 'block'
              }}
              onLoad={() => setLoading(false)}
              onError={() => {
                setError('PDF konnte nicht angezeigt werden');
                setLoading(false);
              }}
            />
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                PDF kann nicht angezeigt werden. Bitte laden Sie die Datei herunter.
              </Alert>
              <Button 
                variant="contained" 
                onClick={handleDownload}
                startIcon={<DownloadIcon />}
              >
                PDF herunterladen
              </Button>
            </Box>
          </object>
        </Box>
      </Box>
    </Box>
  );
};

export default SimplePDFViewer;