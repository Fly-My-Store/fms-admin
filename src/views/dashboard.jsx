'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import {
  ReloadOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  ShopOutlined,
  CarOutlined,
  DollarOutlined,
  CustomerServiceOutlined,
  RollbackOutlined
} from '@ant-design/icons';
import Grid from '@mui/material/Grid2';
import MainCard from 'components/MainCard';
import { getDashboardStats } from 'api/dashboard';

const REFRESH_MS = 60_000;

const formatINR = (cents) => {
  const n = Number(cents);
  if (!Number.isFinite(n)) return '—';
  return `₹${(n / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

const shortId = (id) => (id ? String(id).slice(0, 8) : '—');

function StatCard({ title, value, subtitle, icon, href, color = 'primary.main' }) {
  const content = (
    <MainCard content={false} sx={{ height: '100%' }}>
      <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ p: 2 }}>
        <Box
          sx={{
            flexShrink: 0,
            width: 48,
            height: 48,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'action.hover',
            color
          }}
        >
          {icon}
        </Box>
        <Stack spacing={0.25} sx={{ minWidth: 0, pt: 0.25 }}>
          <Typography variant="h4" lineHeight={1.2}>
            {value}
          </Typography>
          <Typography variant="subtitle2" color="text.primary">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" lineHeight={1.4}>
              {subtitle}
            </Typography>
          )}
        </Stack>
      </Stack>
    </MainCard>
  );

  if (href) {
    return (
      <Box component={Link} href={href} sx={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
        {content}
      </Box>
    );
  }
  return content;
}

function statusChip(value) {
  if (!value) return <Chip size="small" label="—" variant="light" />;
  const color =
    value === 'DELIVERED' || value === 'SUCCESS' || value === 'CAPTURED'
      ? 'success'
      : value === 'CANCELLED' || value === 'FAILED' || value === 'REFUNDED'
        ? 'error'
        : value === 'PENDING' || value === 'CREATED'
          ? 'warning'
          : 'default';
  return <Chip size="small" color={color} label={value} variant="light" />;
}

export default function DashboardView() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async () => {
    try {
      const resp = await getDashboardStats();
      setStats(resp?.data || resp);
      setError(null);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  const orders = stats?.orders || {};
  const payments = stats?.payments || {};
  const recentOrders = stats?.recent_orders || [];

  const statCards = [
    {
      key: 'active-orders',
      title: 'Active orders',
      value: loading ? '…' : (orders.active ?? '—'),
      subtitle: `${orders.today ?? 0} placed today · ${orders.total ?? 0} total`,
      icon: <ShoppingCartOutlined style={{ fontSize: 22 }} />,
      href: '/orders',
      color: 'warning.main',
      size: { xs: 12, sm: 6, lg: 3 }
    },
    {
      key: 'revenue',
      title: "Today's revenue",
      value: loading ? '…' : formatINR(payments.revenue_today_cents),
      subtitle: `${payments.captured_today ?? 0} payments captured today`,
      icon: <DollarOutlined style={{ fontSize: 22 }} />,
      href: '/payments',
      color: 'success.main',
      size: { xs: 12, sm: 6, lg: 3 }
    },
    {
      key: 'customers',
      title: 'Customers',
      value: loading ? '…' : (stats?.customers ?? '—'),
      subtitle: `${stats?.sellers ?? 0} sellers · ${stats?.stores ?? 0} stores`,
      icon: <UserOutlined style={{ fontSize: 22 }} />,
      href: '/customers',
      color: 'primary.main',
      size: { xs: 12, sm: 6, lg: 3 }
    },
    {
      key: 'riders',
      title: 'Riders',
      value: loading ? '…' : (stats?.riders ?? '—'),
      subtitle: 'Delivery fleet',
      icon: <CarOutlined style={{ fontSize: 22 }} />,
      href: '/riders',
      color: 'info.main',
      size: { xs: 12, sm: 6, lg: 3 }
    },
    {
      key: 'support',
      title: 'Open support tickets',
      value: loading ? '…' : (stats?.support_tickets_open ?? '—'),
      subtitle: 'Needs attention',
      icon: <CustomerServiceOutlined style={{ fontSize: 22 }} />,
      href: '/support-tickets',
      color: 'error.main',
      size: { xs: 12, sm: 6, lg: 4 }
    },
    {
      key: 'refunds',
      title: 'Pending refunds',
      value: loading ? '…' : (stats?.refunds_pending ?? '—'),
      subtitle: 'Awaiting processing',
      icon: <RollbackOutlined style={{ fontSize: 22 }} />,
      href: '/refunds',
      color: 'warning.main',
      size: { xs: 12, sm: 6, lg: 4 }
    },
    {
      key: 'stores',
      title: 'Stores',
      value: loading ? '…' : (stats?.stores ?? '—'),
      subtitle: `${stats?.sellers ?? 0} seller accounts`,
      icon: <ShopOutlined style={{ fontSize: 22 }} />,
      href: '/stores',
      color: 'primary.main',
      size: { xs: 12, sm: 6, lg: 4 }
    }
  ];

  return (
    <Stack spacing={2} sx={{ mt: -1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
        <Typography variant="body2" color="text.secondary">
          Platform overview — refreshes every minute
          {lastUpdated ? ` · Updated ${formatDate(lastUpdated)}` : ''}
        </Typography>
        <Tooltip title="Refresh now">
          <IconButton onClick={load} disabled={loading} size="small" aria-label="refresh dashboard">
            <ReloadOutlined />
          </IconButton>
        </Tooltip>
      </Stack>

      {error && (
        <MainCard>
          <Typography color="error">{error}</Typography>
        </MainCard>
      )}

      <Grid container spacing={2}>
        {statCards.map((card) => (
          <Grid key={card.key} size={card.size}>
            <StatCard
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
              icon={card.icon}
              href={card.href}
              color={card.color}
            />
          </Grid>
        ))}
      </Grid>

      <MainCard
        title="Recent orders"
        content={false}
        divider={false}
        sx={{ '& .MuiCardHeader-root': { py: 1.5, px: 2 } }}
      >
        <TableContainer>
          <Table
            size="small"
            sx={{
              tableLayout: 'auto',
              '& .MuiTableCell-root': {
                px: 2,
                py: 1.25,
                whiteSpace: 'nowrap'
              },
              '& .MuiTableCell-root:nth-of-type(2), & .MuiTableCell-root:nth-of-type(3)': {
                whiteSpace: 'normal',
                maxWidth: 180
              }
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Order</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Store</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && recentOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                      No orders yet
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {recentOrders.map((order) => (
                <TableRow
                  key={order.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => router.push(`/orders/${order.id}`)}
                >
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {shortId(order.id)}
                    </Typography>
                  </TableCell>
                  <TableCell>{order.customer?.name || order.customer?.phone || '—'}</TableCell>
                  <TableCell>{order.store?.name || '—'}</TableCell>
                  <TableCell align="right">{formatINR(order.total_cents)}</TableCell>
                  <TableCell>{statusChip(order.status)}</TableCell>
                  <TableCell>{statusChip(order.payment_status)}</TableCell>
                  <TableCell>{formatDate(order.created_at || order.createdAt || order.placed_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </MainCard>
    </Stack>
  );
}
