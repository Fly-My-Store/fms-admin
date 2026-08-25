'use client';

import { useMemo } from 'react';
import PropTypes from 'prop-types';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';

const DOC_FIELDS = [
  { key: 'dl_front_url', label: 'DL front' },
  { key: 'dl_back_url', label: 'DL back' },
  { key: 'aadhar_front_url', label: 'Aadhaar front' },
  { key: 'aadhar_back_url', label: 'Aadhaar back' },
  { key: 'driver_photo_url', label: 'Driver photo' }
];

const LEGACY_DL_KEY = 'driving_license_url';
const DEFAULT_KYC_STATUSES = ['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'RESUBMIT'];

function isPdfUrl(url) {
  return /\.pdf(\?|$)/i.test(String(url || ''));
}

function DocSlot({ label, fileUrl }) {
  const frameSx = {
    width: '100%',
    aspectRatio: '1 / 1',
    objectFit: 'cover',
    borderRadius: 1,
    bgcolor: 'grey.100',
    border: '1px solid',
    borderColor: 'divider',
    display: 'block'
  };

  return (
    <Stack spacing={0.75} sx={{ width: '100%' }}>
      <Typography variant="caption" color="text.secondary" noWrap title={label}>
        {label}
      </Typography>
      {fileUrl && !isPdfUrl(fileUrl) ? (
        <Box
          component="a"
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ display: 'block', '&:hover img': { opacity: 0.92 } }}
        >
          <Box component="img" src={fileUrl} alt={label} sx={frameSx} />
        </Box>
      ) : fileUrl ? (
        <Box
          sx={{
            ...frameSx,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            p: 1
          }}
        >
          <Link href={fileUrl} target="_blank" rel="noopener noreferrer" variant="caption">
            Open PDF
          </Link>
        </Box>
      ) : (
        <Box
          sx={{
            ...frameSx,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant="caption" color="text.disabled">
            Not uploaded
          </Typography>
        </Box>
      )}
    </Stack>
  );
}

DocSlot.propTypes = {
  label: PropTypes.string.isRequired,
  fileUrl: PropTypes.string
};

function buildSlots(documents) {
  const docs = documents && typeof documents === 'object' ? documents : {};
  const slots = DOC_FIELDS.map((f) => ({
    key: f.key,
    label: f.label,
    file_url: docs[f.key] || null
  }));

  // Older uploads used a single DL image key
  if (!docs.dl_front_url && !docs.dl_back_url && docs[LEGACY_DL_KEY]) {
    slots.unshift({
      key: LEGACY_DL_KEY,
      label: 'Driving license',
      file_url: docs[LEGACY_DL_KEY]
    });
  }

  return slots;
}

export default function RiderKycDocumentsPanel({
  documents = {},
  editable = false,
  title = 'Verification',
  kyc = {},
  kycStatuses = DEFAULT_KYC_STATUSES,
  errors = {}
}) {
  const slots = useMemo(() => buildSlots(documents), [documents]);
  const uploadedCount = slots.filter((s) => s.file_url).length;

  return (
    <Stack spacing={2}>
      {title ? (
        <Stack spacing={0.5}>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            Review uploaded documents and set KYC status.
          </Typography>
        </Stack>
      ) : null}

      <Grid container spacing={2} alignItems="stretch">
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="baseline" justifyContent="space-between">
                <Stack spacing={0.25}>
                  <Typography variant="subtitle1">Documents</Typography>
                  <Typography variant="body2" color="text.secondary">
                    From the delivery app. Click a preview to open full size.
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {uploadedCount}/{slots.length} uploaded
                </Typography>
              </Stack>

              {!uploadedCount ? (
                <Alert severity="info" variant="outlined">
                  No documents uploaded yet.
                </Alert>
              ) : null}

              <Box
                sx={{
                  display: 'grid',
                  gap: 1.5,
                  gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    sm: 'repeat(3, 1fr)',
                    md: 'repeat(5, 1fr)'
                  }
                }}
              >
                {slots.map((slot) => (
                  <DocSlot key={slot.key} label={slot.label} fileUrl={slot.file_url} />
                ))}
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Stack spacing={2}>
              <Stack spacing={0.25}>
                <Typography variant="subtitle1">KYC decision</Typography>
                <Typography variant="body2" color="text.secondary">
                  Approve or reject after reviewing documents.
                </Typography>
              </Stack>

              {editable ? (
                <>
                  <TextField
                    select
                    size="small"
                    label="Status"
                    fullWidth
                    value={kyc.status || ''}
                    onChange={(e) => kyc.onStatusChange?.(e.target.value)}
                    error={!!errors.kyc_status}
                    helperText={errors.kyc_status || ''}
                  >
                    {kycStatuses.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    size="small"
                    label="Reason"
                    fullWidth
                    multiline
                    minRows={3}
                    value={kyc.reason || ''}
                    onChange={(e) => kyc.onReasonChange?.(e.target.value)}
                    error={!!errors.kyc_reason}
                    helperText={
                      errors.kyc_reason || 'Required when status is REJECTED or RESUBMIT'
                    }
                  />
                </>
              ) : (
                <Stack spacing={1.5}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Status
                    </Typography>
                    <Typography variant="body2">{kyc.status || '—'}</Typography>
                  </Stack>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Reason
                    </Typography>
                    <Typography variant="body2">
                      {kyc.reason?.trim() ? kyc.reason : '—'}
                    </Typography>
                  </Stack>
                </Stack>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}

RiderKycDocumentsPanel.propTypes = {
  documents: PropTypes.object,
  editable: PropTypes.bool,
  title: PropTypes.string,
  kyc: PropTypes.shape({
    status: PropTypes.string,
    reason: PropTypes.string,
    onStatusChange: PropTypes.func,
    onReasonChange: PropTypes.func
  }),
  kycStatuses: PropTypes.arrayOf(PropTypes.string),
  errors: PropTypes.object
};
