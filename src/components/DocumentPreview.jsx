import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Description as DocIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import SimplePDFViewer from './SimplePDFViewer';

const DocumentPreview = ({ open, onClose, file, fileUrl }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (!file) return null;

  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(extension)) return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) return 'image';
    if (['doc', 'docx'].includes(extension)) return 'document';
    if (['txt'].includes(extension)) return 'text';
    if (['xlsx', 'xls', 'csv'].includes(extension)) return 'spreadsheet';
    return 'unknown';
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return <PdfIcon sx={{ fontSize: 48, color: '#d32f2f' }} />;
      case 'image': return <ImageIcon sx={{ fontSize: 48, color: '#1976d2' }} />;
      case 'document': return <DocIcon sx={{ fontSize: 48, color: '#1976d2' }} />;
      default: return <FileIcon sx={{ fontSize: 48, color: '#757575' }} />;
    }
  };

  const fileType = getFileType(file.name || file.title || '');
  const displayUrl = fileUrl || (file.url ? file.url : null);

  const handleDownload = async () => {
    if (displayUrl) {
      try {
        // Versuche zuerst einen direkten Download
        const link = document.createElement('a');
        link.href = displayUrl;
        link.download = file.name || file.title || 'document';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Falls der direkte Download nicht funktioniert, öffne in neuem Tab
        setTimeout(() => {
          window.open(displayUrl, '_blank');
        }, 100);
      } catch (error) {
        console.error('Download failed:', error);
        // Fallback: Öffne URL in neuem Tab
        window.open(displayUrl, '_blank');
      }
    }
  };

  const renderPreview = () => {
    if (!displayUrl) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: 300,
          gap: 2
        }}>
          {getFileIcon(fileType)}
          <Typography variant="h6">{file.name || file.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {file.size && `Größe: ${file.size}`}
          </Typography>
          <Alert severity="info">
            Vorschau nicht verfügbar. Datei kann heruntergeladen werden.
          </Alert>
        </Box>
      );
    }

    switch (fileType) {
      case 'pdf':
        return (
          <Box sx={{ width: '100%', height: '70vh' }}>
            <SimplePDFViewer file={file} fileUrl={displayUrl} />
          </Box>
        );
      
      case 'image':
        return (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            maxHeight: '70vh',
            overflow: 'auto'
          }}>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            )}
            <img
              src={displayUrl}
              alt={file.name || file.title}
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%', 
                objectFit: 'contain',
                display: loading ? 'none' : 'block'
              }}
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError('Bild konnte nicht geladen werden');
              }}
            />
          </Box>
        );
      
      case 'text':
        return (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: 300,
            gap: 2
          }}>
            {getFileIcon(fileType)}
            <Typography variant="h6">{file.name || file.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {file.size && `Größe: ${file.size}`}
            </Typography>
            <Alert severity="info">
              Textdatei-Vorschau nicht verfügbar. Datei kann heruntergeladen werden.
            </Alert>
          </Box>
        );
      
      default:
        return (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: 300,
            gap: 2
          }}>
            {getFileIcon(fileType)}
            <Typography variant="h6">{file.name || file.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {file.size && `Größe: ${file.size}`}
            </Typography>
            <Alert severity="info">
              Vorschau für diesen Dateityp nicht verfügbar. Datei kann heruntergeladen werden.
            </Alert>
          </Box>
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {file.name || file.title || 'Dokument'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {displayUrl && (
            <IconButton onClick={handleDownload} color="primary">
              <DownloadIcon />
            </IconButton>
          )}
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        {error ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : (
          renderPreview()
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Schließen</Button>
        {displayUrl && (
          <Button onClick={handleDownload} variant="contained" startIcon={<DownloadIcon />}>
            Herunterladen
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DocumentPreview;