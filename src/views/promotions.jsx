'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import MainCard from 'components/MainCard';
import { approvePromotion, listPromotions, rejectPromotion } from 'api/promotions';
import {
  getPromotionFundingLabel,
  getPromotionStatusChipColor,
  getPromotionStatusLabel,
  getPromotionVisibilityLabel
} from 'utils/promotionLabels';

function formatDiscount(row) {
  if (row.discount_type === 'FLAT') return `₹${(Number(row.discount_value) / 100).toFixed(2)}`;
  if (row.discount_type === 'FREE_DELIVERY') return 'Free delivery';
  return `${row.discount_value}%`;
}

export default function PromotionsView() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingOnly, setPendingOnly] = useState(false);
  const [q, setQ] = useState('');
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listPromotions({
        page: 1,
        limit: 50,
        ...(q ? { q } : {}),
        ...(pendingOnly ? { pending_only: true } : {})
      });
      setRows(res?.data || []);
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e.message || 'Failed to load', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [q, pendingOnly]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <MainCard title="Promotions">
      <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
          <TextField size="small" label="Search" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button variant={pendingOnly ? 'contained' : 'outlined'} onClick={() => setPendingOnly((v) => !v)}>
            Pending seller
          </Button>
          <Button variant="outlined" onClick={load} disabled={loading}>
            Refresh
          </Button>
          <Button variant="contained" onClick={() => router.push('/promotions/create')}>
            Create
          </Button>
        </Stack>

        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Funding</TableCell>
                <TableCell>Visibility</TableCell>
                <TableCell>Store</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ cursor: 'pointer', color: 'primary.main' }}
                      onClick={() => router.push(`/promotions/${row.id}`)}
                    >
                      {row.code}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.title}</TableCell>
                  <TableCell>{formatDiscount(row)}</TableCell>
                  <TableCell>{getPromotionFundingLabel(row.funding)}</TableCell>
                  <TableCell>{getPromotionVisibilityLabel(row.visibility)}</TableCell>
                  <TableCell>{row.store?.name || (row.store_id ? row.store_id.slice(0, 8) : 'App-wide')}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={getPromotionStatusLabel(row.status)}
                      color={getPromotionStatusChipColor(row.status)}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
                      <Button size="small" onClick={() => router.push(`/promotions/${row.id}`)}>
                        View
                      </Button>
                      {row.status === 'PENDING_APPROVAL' ? (
                        <>
                          <Button
                            size="small"
                            onClick={() =>
                              approvePromotion(row.id)
                                .then(load)
                                .catch((e) =>
                                  enqueueSnackbar(e?.response?.data?.message || 'Approve failed', { variant: 'error' })
                                )
                            }
                          >
                            Approve
                          </Button>
                          <Button size="small" color="warning" onClick={() => setRejectId(row.id)}>
                            Reject
                          </Button>
                        </>
                      ) : null}
                      <Button size="small" onClick={() => router.push(`/promotions/edit/${row.id}`)}>
                        Edit
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {!rows.length && !loading ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography color="text.secondary">No promotions yet.</Typography>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </Box>

        <Dialog open={Boolean(rejectId)} onClose={() => setRejectId(null)} fullWidth maxWidth="sm">
          <DialogTitle>Reject promotion</DialogTitle>
          <DialogContent>
            <TextField
              label="Reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              fullWidth
              multiline
              minRows={3}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectId(null)}>Cancel</Button>
            <Button
              color="warning"
              variant="contained"
              onClick={async () => {
                try {
                  await rejectPromotion(rejectId, { reason: rejectReason });
                  setRejectId(null);
                  setRejectReason('');
                  load();
                } catch (e) {
                  enqueueSnackbar(e?.response?.data?.message || 'Reject failed', { variant: 'error' });
                }
              }}
            >
              Reject
            </Button>
          </DialogActions>
        </Dialog>
      </MainCard>
  );
}
