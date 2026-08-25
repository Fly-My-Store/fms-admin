'use client';

import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';
import {
  approveStoreListingCsv,
  listStoreListingCsv,
  rejectStoreListingCsv
} from 'api/listingsInventory';

const PAGE_SIZE = 10;

function statusChip(status) {
  const color = status === 'APPROVED' ? 'success' : status === 'REJECTED' ? 'error' : 'warning';
  return <Chip size="small" color={color} label={status || '—'} variant="light" />;
}

export default function StoreListingCsvQueue({ storeId, isDemo }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [rejectRow, setRejectRow] = useState(null);
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    if (!storeId || isDemo) return;
    setLoading(true);
    try {
      const resp = await listStoreListingCsv(storeId, { page: 1, limit: PAGE_SIZE });
      setItems(Array.isArray(resp?.data) ? resp.data : []);
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Failed to load listing CSVs', { variant: 'error' });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [storeId, isDemo]);

  useEffect(() => {
    load();
  }, [load]);

  const onApprove = async (row) => {
    setBusyId(row.id);
    try {
      await approveStoreListingCsv(storeId, row.id);
      enqueueSnackbar('Listing CSV approved — download it and bulk-add on this store', { variant: 'success' });
      await load();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Approve failed', { variant: 'error' });
    } finally {
      setBusyId(null);
    }
  };

  const onReject = async () => {
    if (!rejectRow) return;
    const note = String(reason || '').trim();
    if (!note) {
      enqueueSnackbar('A reason is required when rejecting', { variant: 'warning' });
      return;
    }
    setBusyId(rejectRow.id);
    try {
      await rejectStoreListingCsv(storeId, rejectRow.id, note);
      enqueueSnackbar('Listing CSV rejected', { variant: 'success' });
      setRejectRow(null);
      setReason('');
      await load();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Reject failed', { variant: 'error' });
    } finally {
      setBusyId(null);
    }
  };

  if (!storeId) return null;

  if (isDemo) {
    return (
      <MainCard title="Store listing CSVs">
        <Alert severity="info">Listing CSV review is only available for live stores.</Alert>
      </MainCard>
    );
  }

  return (
    <MainCard title="Store listing CSVs" subheader="Seller uploads for you to download, then bulk-add. Approving does not create listings.">
      {loading && (
        <Stack alignItems="center" py={2}>
          <CircularProgress size={22} />
        </Stack>
      )}
      {!loading && items.length === 0 && <Alert severity="info">No listing CSVs uploaded by this store yet.</Alert>}
      {!loading && items.length > 0 && (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>File</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Uploaded</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((row) => {
              const pending = row.status === 'PENDING';
              return (
                <TableRow key={row.id}>
                  <TableCell>
                    <Typography variant="body2">{row.file_name || 'listing.csv'}</Typography>
                    {row.reviewer_note ? (
                      <Typography variant="caption" color="text.secondary">
                        {row.reviewer_note}
                      </Typography>
                    ) : null}
                  </TableCell>
                  <TableCell>{statusChip(row.status)}</TableCell>
                  <TableCell>
                    {row.created_at || row.createdAt
                      ? new Date(row.created_at || row.createdAt).toLocaleString(undefined, {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })
                      : '—'}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {row.file_url ? (
                        <Button size="small" href={row.file_url} target="_blank" rel="noopener noreferrer">
                          Download
                        </Button>
                      ) : null}
                      {pending ? (
                        <>
                          <Button size="small" disabled={busyId === row.id} onClick={() => onApprove(row)}>
                            Approve
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            disabled={busyId === row.id}
                            onClick={() => {
                              setRejectRow(row);
                              setReason('');
                            }}
                          >
                            Reject
                          </Button>
                        </>
                      ) : null}
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <Dialog open={Boolean(rejectRow)} onClose={() => !busyId && setRejectRow(null)} fullWidth maxWidth="xs">
        <DialogTitle>Reject listing CSV</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason"
            fullWidth
            multiline
            minRows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectRow(null)} disabled={Boolean(busyId)}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={onReject} disabled={Boolean(busyId)}>
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}

StoreListingCsvQueue.propTypes = {
  storeId: PropTypes.string,
  isDemo: PropTypes.bool
};
