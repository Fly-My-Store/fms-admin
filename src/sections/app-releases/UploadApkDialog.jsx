'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { CloseOutlined, InboxOutlined } from '@ant-design/icons';
import { parseVersionFromFileName, uploadRelease } from 'api/appReleases';

function isApkFile(file) {
  if (!file) return false;
  const name = String(file.name || '').toLowerCase();
  return name.endsWith('.apk');
}

export default function UploadApkDialog({ open, onClose, appType, onSaved }) {
  const [file, setFile] = useState(null);
  const [version, setVersion] = useState('');
  const [versionCode, setVersionCode] = useState('');
  const [notes, setNotes] = useState('');
  const [setCurrent, setSetCurrent] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const dragDepthRef = useRef(0);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setVersion('');
      setVersionCode('');
      setNotes('');
      setSetCurrent(true);
      setUploading(false);
      setProgress(0);
      setDragActive(false);
      dragDepthRef.current = 0;
    }
  }, [open]);

  const applyFile = useCallback((picked) => {
    if (!picked) return;
    if (!isApkFile(picked)) {
      enqueueSnackbar('Only .apk files are allowed', { variant: 'warning' });
      return;
    }
    setFile(picked);
    setVersion((prev) => {
      if (prev) return prev;
      return parseVersionFromFileName(picked.name) || prev;
    });
  }, []);

  const handleFileChange = (e) => {
    applyFile(e.target.files?.[0] || null);
    e.target.value = '';
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (uploading) return;
    dragDepthRef.current += 1;
    setDragActive(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (uploading) return;
    e.dataTransfer.dropEffect = 'copy';
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (uploading) return;
    dragDepthRef.current -= 1;
    if (dragDepthRef.current <= 0) {
      dragDepthRef.current = 0;
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current = 0;
    setDragActive(false);
    if (uploading) return;

    const dropped = e.dataTransfer.files?.[0] || null;
    applyFile(dropped);
  };

  const handleSubmit = async () => {
    if (!file) {
      enqueueSnackbar('Select an APK file', { variant: 'warning' });
      return;
    }
    if (!version.trim()) {
      enqueueSnackbar('Version is required', { variant: 'warning' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('app_type', appType);
    formData.append('version', version.trim());
    if (versionCode.trim()) formData.append('version_code', versionCode.trim());
    if (notes.trim()) formData.append('notes', notes.trim());
    formData.append('set_current', setCurrent ? 'true' : 'false');

    setUploading(true);
    setProgress(0);
    try {
      await uploadRelease(formData, (evt) => {
        if (!evt.total) return;
        setProgress(Math.round((evt.loaded * 100) / evt.total));
      });
      enqueueSnackbar('APK uploaded', { variant: 'success' });
      onSaved?.();
    } catch (e) {
      enqueueSnackbar(e?.message || 'Upload failed', { variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={uploading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pr: 6 }}>
        Upload APK
        <IconButton
          onClick={onClose}
          disabled={uploading}
          sx={{ position: 'absolute', right: 12, top: 12 }}
        >
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <Box
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            sx={{
              border: '2px dashed',
              borderColor: dragActive ? 'primary.main' : 'divider',
              borderRadius: 2,
              bgcolor: dragActive ? 'primary.lighter' : 'background.paper',
              px: 2,
              py: 3,
              textAlign: 'center',
              cursor: uploading ? 'not-allowed' : 'pointer',
              transition: 'border-color 0.15s ease, background-color 0.15s ease',
              opacity: uploading ? 0.6 : 1,
            }}
          >
            <Stack spacing={1} alignItems="center">
              <InboxOutlined style={{ fontSize: 36, opacity: 0.7 }} />
              <Typography variant="subtitle1">
                {file ? file.name : 'Drag & drop APK here'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or click to browse
              </Typography>
              {file ? (
                <Typography variant="caption" color="text.secondary">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </Typography>
              ) : null}
            </Stack>
            <input
              ref={fileInputRef}
              hidden
              type="file"
              accept=".apk,application/vnd.android.package-archive"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </Box>

          {file ? (
            <Button
              size="small"
              variant="text"
              disabled={uploading}
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              sx={{ alignSelf: 'flex-start', mt: -1 }}
            >
              Clear file
            </Button>
          ) : null}

          <TextField
            label="Version"
            placeholder="0.0.8"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            required
            disabled={uploading}
            fullWidth
          />

          <TextField
            label="Version code (optional)"
            placeholder="8"
            value={versionCode}
            onChange={(e) => setVersionCode(e.target.value)}
            disabled={uploading}
            fullWidth
          />

          <TextField
            label="Release notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={uploading}
            fullWidth
            multiline
            minRows={2}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={setCurrent}
                onChange={(e) => setSetCurrent(e.target.checked)}
                disabled={uploading}
              />
            }
            label="Set as current release"
          />

          {uploading ? (
            <Stack spacing={0.5}>
              <LinearProgress variant={progress > 0 ? 'determinate' : 'indeterminate'} value={progress} />
              <Typography variant="caption" color="text.secondary">
                Uploading… {progress > 0 ? `${progress}%` : ''}
              </Typography>
            </Stack>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={uploading}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={uploading}>
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}

UploadApkDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  appType: PropTypes.string.isRequired,
  onSaved: PropTypes.func,
};
