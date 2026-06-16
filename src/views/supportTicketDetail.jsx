'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Alert,
  Button,
  Chip,
  Grid,
  Link as MuiLink,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import { getSupportTicket, updateSupportTicket } from 'api/support';

const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const safe = (v) => (v === null || v === undefined || v === '' ? '—' : String(v));

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

const shortId = (id) => (id ? String(id).slice(0, 8) : '—');

const KV = ({ label, value, children }) => (
  <Stack direction="row" spacing={1.5} alignItems="baseline">
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
      {label}
    </Typography>
    {children || <Typography variant="body2">{safe(value)}</Typography>}
  </Stack>
);

function StatusChip({ value }) {
  if (!value) return null;
  const color =
    value === 'RESOLVED' || value === 'CLOSED'
      ? 'success'
      : value === 'IN_PROGRESS'
        ? 'warning'
        : 'default';
  return <Chip size="small" color={color} label={value} variant="light" />;
}

export default function SupportTicketDetailView() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const resp = await getSupportTicket(id);
      const data = resp?.data ?? resp;
      setTicket(data);
      setStatus(data?.status || 'OPEN');
      setAdminNotes(data?.admin_notes || '');
    } catch {
      enqueueSnackbar('Failed to load ticket', { variant: 'error' });
      setTicket(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const breadcrumb = useMemo(
    () => ({
      heading: 'support-ticket',
      links: [
        { title: 'home', to: '/dashboard' },
        { title: 'support-tickets', to: '/support-tickets' },
        { title: shortId(id), i18n: false }
      ]
    }),
    [id]
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const resp = await updateSupportTicket(id, { status, admin_notes: adminNotes });
      const data = resp?.data ?? resp;
      setTicket(data);
      enqueueSnackbar('Ticket updated', { variant: 'success' });
    } catch (e) {
      enqueueSnackbar(e?.message || 'Update failed', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const requester = ticket?.requester;

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />

      {loading && <Alert severity="info">Loading ticket…</Alert>}

      {!loading && !ticket && <Alert severity="error">Ticket not found.</Alert>}

      {!loading && ticket && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <MainCard border={false} boxShadow>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                <Stack spacing={0.5}>
                  <Typography variant="h5">{ticket.subject}</Typography>
                  <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                    {ticket.id}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <StatusChip value={ticket.status} />
                  <Chip size="small" variant="outlined" label={ticket.requester_type} />
                  <Chip size="small" variant="outlined" label={ticket.ticket_type} />
                </Stack>
              </Stack>
            </MainCard>
          </Grid>

          <Grid item xs={12} md={7}>
            <MainCard title="Details">
              <Stack spacing={1.5}>
                <KV label="Category" value={ticket.category_label || ticket.category} />
                {ticket.category_other ? <KV label="Other category" value={ticket.category_other} /> : null}
                <KV label="Created" value={formatDate(ticket.created_at)} />
                {ticket.resolved_at ? <KV label="Resolved" value={formatDate(ticket.resolved_at)} /> : null}
                <Typography variant="subtitle2" sx={{ pt: 1 }}>
                  Description
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {ticket.description}
                </Typography>
                {ticket.attachments?.length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ pt: 1 }}>
                      Attachments
                    </Typography>
                    <Stack spacing={0.5}>
                      {ticket.attachments.map((a) => (
                        <MuiLink key={a.id || a.file_url} href={a.file_url} target="_blank" rel="noopener">
                          {a.file_name || 'Attachment'}
                        </MuiLink>
                      ))}
                    </Stack>
                  </>
                )}
              </Stack>
            </MainCard>
          </Grid>

          <Grid item xs={12} md={5}>
            <Stack spacing={2}>
              <MainCard title="Requester">
                <Stack spacing={1}>
                  <KV label="Name" value={requester?.name} />
                  <KV label="Phone" value={requester?.phone} />
                  <KV label="Email" value={requester?.email} />
                </Stack>
              </MainCard>

              <MainCard title="Context">
                <Stack spacing={1}>
                  {ticket.order_id && (
                    <KV label="Order">
                      <MuiLink component={Link} href={`/orders/${ticket.order_id}`}>
                        {shortId(ticket.order_id)}
                      </MuiLink>
                    </KV>
                  )}
                  {ticket.delivery_id && <KV label="Delivery / job" value={shortId(ticket.delivery_id)} />}
                  {ticket.store?.name && <KV label="Store" value={ticket.store.name} />}
                  {!ticket.order_id && !ticket.delivery_id && !ticket.store?.name && (
                    <Typography variant="body2" color="text.secondary">
                      General ticket — no order or job linked.
                    </Typography>
                  )}
                </Stack>
              </MainCard>

              <MainCard title="Admin actions">
                <Stack spacing={2}>
                  <TextField
                    select
                    size="small"
                    label="Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    fullWidth
                  >
                    {STATUSES.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Internal notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    multiline
                    minRows={3}
                    fullWidth
                    placeholder="Notes visible to admins only"
                  />
                  <Button variant="contained" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving…' : 'Save changes'}
                  </Button>
                </Stack>
              </MainCard>
            </Stack>
          </Grid>
        </Grid>
      )}
    </>
  );
}
