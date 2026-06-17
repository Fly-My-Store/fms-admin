'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Alert,
  Avatar,
  Button,
  Chip,
  Stack,
  Typography
} from '@mui/material';
import { useRouter } from 'next/navigation';
import Grid from '@mui/material/Grid2';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import EntityOrdersCard from 'sections/orders/EntityOrdersCard';
import StoreSupportTicketsCard from 'sections/stores/StoreSupportTicketsCard';
import CustomerRefundsCard from 'sections/customers/CustomerRefundsCard';
import CustomerCartsCard from 'sections/customers/CustomerCartsCard';
import CustomerPaymentsCard from 'sections/customers/CustomerPaymentsCard';
import CustomerAddressesCard from 'sections/customers/CustomerAddressesCard';
import { getUser } from 'api/iam';
import { TABLE_STATUS } from 'utils/constants';

const safe = (v) => (v === null || v === undefined || v === '' ? '—' : String(v));

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

function AccountStatusChip({ value }) {
  switch (Number(value)) {
    case TABLE_STATUS.ACTIVE:
      return <Chip size="small" color="success" label="Active" variant="light" />;
    case TABLE_STATUS.INACTIVE:
      return <Chip size="small" color="warning" label="Inactive" variant="light" />;
    case TABLE_STATUS.SUSPENDED:
      return <Chip size="small" color="error" label="Suspended" variant="light" />;
    case TABLE_STATUS.DELETED:
      return <Chip size="small" color="default" label="Deleted" variant="light" />;
    default:
      return <Chip size="small" color="default" label={safe(value)} variant="light" />;
  }
}

const KV = ({ label, value }) => (
  <Stack direction="row" spacing={1.5} alignItems="baseline">
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
      {label}
    </Typography>
    <Typography variant="body2">{safe(value)}</Typography>
  </Stack>
);

export default function CustomerDetailView() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await getUser(id);
        if (!cancelled) setData(resp?.data || resp);
      } catch (e) {
        if (!cancelled) {
          setError(e?.response?.data?.message || e?.message || 'Failed to load customer');
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const breadcrumb = useMemo(() => {
    const name = data?.name || data?.phone || data?.email || id || 'customer';
    return {
      heading: 'customers',
      links: [
        { title: 'home', to: '/dashboard' },
        { title: 'customers', to: '/customers' },
        { title: name, i18n: false }
      ]
    };
  }, [data?.email, data?.name, data?.phone, id]);

  const displayName = data?.name || data?.phone || data?.email || 'Customer';
  const phone = data?.phone || '—';
  const statusActor =
    data?.status_changed_by_user?.name ||
    data?.status_changed_by_user?.email ||
    null;

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />

      {loading && <Alert severity="info">Loading customer…</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && data && (
        <Grid container spacing={2}>
          <Grid size={12}>
            <MainCard border={false} boxShadow>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ width: 48, height: 48 }}>
                    {(displayName || 'C').slice(0, 1).toUpperCase()}
                  </Avatar>
                  <Stack spacing={0.5}>
                    <Typography variant="h5">{displayName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {safe(data.email)} · {phone}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                      {data.id}
                    </Typography>
                  </Stack>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                  <Chip size="small" variant="outlined" label={`Type: ${data.type || 'CUSTOMER'}`} />
                  <AccountStatusChip value={data.status} />
                  <Button size="small" variant="outlined" onClick={() => router.push(`/customers/edit/${id}`)}>
                    Manage account
                  </Button>
                </Stack>
              </Stack>
            </MainCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="Account">
              <Stack spacing={1}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
                    Status
                  </Typography>
                  <AccountStatusChip value={data.status} />
                </Stack>
                {data.status_reason && Number(data.status) !== TABLE_STATUS.ACTIVE && (
                  <KV label="Status reason" value={data.status_reason} />
                )}
                {data.status_changed_at && (
                  <KV label="Status updated" value={formatDate(data.status_changed_at)} />
                )}
                {statusActor && <KV label="Updated by" value={statusActor} />}
              </Stack>
            </MainCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="Profile">
              <Stack spacing={1}>
                <KV label="Name" value={data.name} />
                <KV label="Email" value={data.email} />
                <KV label="Phone" value={phone} />
                <KV label="Provider" value={data.provider || data.auth_provider} />
                <KV label="Email verified" value={formatDate(data.email_verified_at)} />
                <KV label="Phone verified" value={formatDate(data.phone_verified_at)} />
              </Stack>
            </MainCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="Activity">
              <Stack spacing={1}>
                <KV label="Joined" value={formatDate(data.created_at || data.createdAt)} />
                <KV label="Last login" value={formatDate(data.last_login_at)} />
                <KV label="Last seen" value={formatDate(data.last_seen_at)} />
                <KV label="Updated" value={formatDate(data.updated_at || data.updatedAt)} />
              </Stack>
            </MainCard>
          </Grid>

          <Grid size={12}>
            <MainCard title="Orders" content={false}>
              <EntityOrdersCard userId={id} showTitle={false} />
            </MainCard>
          </Grid>

          <Grid size={12}>
            <MainCard title="Support tickets" content={false}>
              <StoreSupportTicketsCard userId={id} hideRequesterColumn showTableTitle={false} />
            </MainCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="Payments" content={false}>
              <CustomerPaymentsCard userId={id} showTitle={false} />
            </MainCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="Refunds" content={false}>
              <CustomerRefundsCard userId={id} showTitle={false} />
            </MainCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="Carts" content={false}>
              <CustomerCartsCard userId={id} showTitle={false} />
            </MainCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="Saved addresses" content={false}>
              <CustomerAddressesCard userId={id} showTitle={false} />
            </MainCard>
          </Grid>
        </Grid>
      )}

      {!loading && !data && !error && (
        <Alert severity="warning">Customer not found.</Alert>
      )}
    </>
  );
}
