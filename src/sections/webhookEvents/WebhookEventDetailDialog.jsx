'use client';

import PropTypes from 'prop-types';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography
} from '@mui/material';
import Chip from '@mui/material/Chip';
import { CloseOutlined, ReloadOutlined } from '@ant-design/icons';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

const statusColor = (value) => {
  if (value === 'PROCESSED' || value === 'SUCCESS') return 'success';
  if (value === 'FAILED' || value === 'ERROR') return 'error';
  if (value === 'PENDING') return 'warning';
  return 'default';
};

export default function WebhookEventDetailDialog({
  open,
  onClose,
  event,
  loading,
  replayLoading,
  replayResult,
  onReplay
}) {
  const payloadText = event?.payload
    ? JSON.stringify(event.payload, null, 2)
    : '—';

  const outcomeText = replayResult
    ? JSON.stringify(replayResult, null, 2)
    : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        Webhook event
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 12, top: 12 }}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Stack alignItems="center" py={4}>
            <CircularProgress size={28} />
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip size="small" label={event?.provider || '—'} />
              <Chip size="small" label={event?.event || '—'} variant="outlined" />
              <Chip
                size="small"
                color={statusColor(event?.status)}
                label={event?.status || '—'}
                variant="light"
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Received: {formatDate(event?.received_at || event?.created_at)}
              {event?.processed_at ? ` · Processed: ${formatDate(event.processed_at)}` : ''}
            </Typography>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Payload
              </Typography>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: 'grey.100',
                  fontSize: 12,
                  overflow: 'auto',
                  maxHeight: 360
                }}
              >
                {payloadText}
              </Box>
            </Box>
            {outcomeText ? (
              <Alert severity="info" sx={{ '& pre': { m: 0, mt: 1, fontSize: 12, overflow: 'auto' } }}>
                <Typography variant="subtitle2">Last replay outcome</Typography>
                <pre>{outcomeText}</pre>
              </Alert>
            ) : null}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={replayLoading ? <CircularProgress size={16} color="inherit" /> : <ReloadOutlined />}
          disabled={!event?.id || replayLoading || event?.provider !== 'razorpay'}
          onClick={() => onReplay?.(event)}
        >
          Replay
        </Button>
      </DialogActions>
    </Dialog>
  );
}

WebhookEventDetailDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  event: PropTypes.object,
  loading: PropTypes.bool,
  replayLoading: PropTypes.bool,
  replayResult: PropTypes.object,
  onReplay: PropTypes.func
};
