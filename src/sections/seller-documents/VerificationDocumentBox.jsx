'use client';

import PropTypes from 'prop-types';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export const DOC_THUMB_SIZE = 72;
export const VERIFICATION_BOX_MIN_HEIGHT = 380;

function isPdfUrl(url) {
  return /\.pdf(\?|$)/i.test(String(url || ''));
}

export function DocumentThumb({ label, fileUrl }) {
  const thumbSx = {
    width: DOC_THUMB_SIZE,
    height: DOC_THUMB_SIZE,
    objectFit: 'cover',
    borderRadius: 1,
    bgcolor: 'grey.100',
    flexShrink: 0,
  };

  return (
    <Stack spacing={0.5} sx={{ width: DOC_THUMB_SIZE, flexShrink: 0 }}>
      <Typography variant="caption" color="text.secondary" noWrap title={label}>
        {label}
      </Typography>
      {fileUrl && !isPdfUrl(fileUrl) ? (
        <Box component="a" href={fileUrl} target="_blank" rel="noopener noreferrer" sx={{ display: 'block' }}>
          <Box component="img" src={fileUrl} alt={label} sx={thumbSx} />
        </Box>
      ) : fileUrl ? (
        <Link href={fileUrl} target="_blank" rel="noopener noreferrer" variant="caption" sx={{ wordBreak: 'break-all' }}>
          PDF
        </Link>
      ) : (
        <Box
          sx={{
            ...thumbSx,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary">No file</Typography>
        </Box>
      )}
    </Stack>
  );
}

DocumentThumb.propTypes = {
  label: PropTypes.string.isRequired,
  fileUrl: PropTypes.string,
};

export default function VerificationDocumentBox({
  title,
  hint,
  docs = [],
  status,
  reason,
  statusOptions = [],
  onStatusChange,
  onReasonChange,
  editable = false,
  statusError,
  reasonError,
  reasonHint,
  emptyMessage = 'No documents uploaded yet.',
  footer,
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        flex: 1,
        minWidth: 0,
        minHeight: VERIFICATION_BOX_MIN_HEIGHT,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack spacing={1.5} sx={{ flex: 1 }}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle1">{title}</Typography>
          {hint ? (
            <Typography variant="body2" color="text.secondary">{hint}</Typography>
          ) : null}
        </Stack>

        <Box sx={{ minHeight: DOC_THUMB_SIZE + 24 }}>
          {docs.length ? (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {docs.map((doc) => (
                <DocumentThumb
                  key={doc.id || doc.label || doc.doc_type}
                  label={doc.label || doc.doc_type}
                  fileUrl={doc.file_url}
                />
              ))}
            </Stack>
          ) : (
            <Alert severity="info" variant="outlined" sx={{ py: 0.5 }}>
              {emptyMessage}
            </Alert>
          )}
        </Box>

        <Stack spacing={1.5} sx={{ mt: 'auto' }}>
          <Stack sx={{ gap: 0.75, width: '100%' }}>
            <InputLabel>Status</InputLabel>
            {editable ? (
              <TextField
                select
                size="small"
                fullWidth
                value={status || ''}
                onChange={(e) => onStatusChange?.(e.target.value)}
                error={!!statusError}
                helperText={statusError || ''}
              >
                {statusOptions.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            ) : (
              <Typography variant="body2">{status || '—'}</Typography>
            )}
          </Stack>
          <Stack sx={{ gap: 0.75, width: '100%' }}>
            <InputLabel>Reason</InputLabel>
            {editable ? (
              <TextField
                size="small"
                fullWidth
                multiline
                minRows={2}
                value={reason || ''}
                onChange={(e) => onReasonChange?.(e.target.value)}
                error={!!reasonError}
                helperText={reasonError || reasonHint || ''}
              />
            ) : (
              <Typography variant="body2">{reason?.trim() ? reason : '—'}</Typography>
            )}
          </Stack>
          {footer || null}
        </Stack>
      </Stack>
    </Paper>
  );
}

VerificationDocumentBox.propTypes = {
  title: PropTypes.string.isRequired,
  hint: PropTypes.string,
  docs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      doc_type: PropTypes.string,
      label: PropTypes.string,
      file_url: PropTypes.string,
    }),
  ),
  status: PropTypes.string,
  reason: PropTypes.string,
  statusOptions: PropTypes.arrayOf(PropTypes.string),
  onStatusChange: PropTypes.func,
  onReasonChange: PropTypes.func,
  editable: PropTypes.bool,
  statusError: PropTypes.string,
  reasonError: PropTypes.string,
  reasonHint: PropTypes.string,
  emptyMessage: PropTypes.string,
  footer: PropTypes.node,
};
