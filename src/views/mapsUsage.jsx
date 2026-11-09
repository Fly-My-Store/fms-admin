'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip, Grid, Link, MenuItem, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography
} from '@mui/material';
import MainCard from 'components/MainCard';
import { getMapsUsage } from 'api/audit';
import { estimateMapsCostInr, formatEstimatedCostInr, GOOGLE_MAPS_PRICING } from 'config/googleMapsPricing';

const PRODUCTS = ['', 'BACKEND', 'CUSTOMER', 'SELLER', 'DELIVERY', 'ADMIN'];
const SERVICES = ['', 'GEOCODING', 'PLACES', 'ROUTES', 'ROUTE_MATRIX', 'DISTANCE_MATRIX', 'DYNAMIC_MAPS', 'MAPS_SDK'];
const RESULTS = ['', 'SUCCESS', 'FAILURE', 'TIMEOUT', 'CACHE_HIT', 'DEDUPLICATED', 'SKIPPED', 'FALLBACK'];
const EXCHANGE_RATE_CACHE_KEY = 'maps-usage-usd-inr-rate-v1';
const EXCHANGE_RATE_CACHE_MS = 24 * 60 * 60 * 1000;

function localDate(date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function presetDates(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  return { from: localDate(start), to: localDate(end) };
}

function toBoundary(value, endOfDay = false) {
  if (!value) return undefined;
  return new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}`).toISOString();
}

export default function MapsUsageView() {
  const [filters, setFilters] = useState({ product: '', service: '', result: '', ...presetDates(7) });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState({
    rate: GOOGLE_MAPS_PRICING.fallbackUsdToInr,
    date: null,
    source: 'Fallback rate'
  });

  useEffect(() => {
    let active = true;
    const loadExchangeRate = async () => {
      let cached = null;
      try {
        cached = JSON.parse(localStorage.getItem(EXCHANGE_RATE_CACHE_KEY) || 'null');
      } catch {
        cached = null;
      }
      if (cached?.rate > 0 && Date.now() - Number(cached.cachedAt) < EXCHANGE_RATE_CACHE_MS) {
        if (active) setExchangeRate({ rate: cached.rate, date: cached.date, source: 'Frankfurter (cached)' });
        return;
      }
      try {
        const response = await fetch(GOOGLE_MAPS_PRICING.exchangeRateSource);
        if (!response.ok) throw new Error('Exchange-rate request failed');
        const payload = await response.json();
        const rate = Number(payload?.rates?.INR);
        if (!Number.isFinite(rate) || rate <= 0) throw new Error('Invalid exchange rate');
        const next = { rate, date: payload.date || null, cachedAt: Date.now() };
        localStorage.setItem(EXCHANGE_RATE_CACHE_KEY, JSON.stringify(next));
        if (active) setExchangeRate({ rate, date: next.date, source: 'Frankfurter' });
      } catch {
        if (cached?.rate > 0 && active) {
          setExchangeRate({ rate: cached.rate, date: cached.date, source: 'Frankfurter (last cached)' });
        }
      }
    };
    loadExchangeRate();
    return () => { active = false; };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getMapsUsage({
        product: filters.product || undefined,
        service: filters.service || undefined,
        result: filters.result || undefined,
        from: toBoundary(filters.from),
        to: toBoundary(filters.to, true),
        page: page + 1,
        limit: pageSize
      });
      setData(response?.data || response);
    } catch (requestError) {
      setError(requestError?.message || 'Unable to load Google Maps usage');
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 60000);
    return () => clearInterval(timer);
  }, [load]);

  const updateFilter = (patch) => {
    setPage(0);
    setFilters((value) => ({ ...value, ...patch }));
  };
  const totals = data?.totals || {};
  const estimatedCost = useMemo(
    () => estimateMapsCostInr(data?.billable_by_service, exchangeRate.rate),
    [data?.billable_by_service, exchangeRate.rate]
  );
  const estimatedSavings = useMemo(
    () => estimateMapsCostInr(data?.saved_by_service, exchangeRate.rate),
    [data?.saved_by_service, exchangeRate.rate]
  );
  const cards = [
    ['Estimated list cost', formatEstimatedCostInr(estimatedCost)],
    ['Estimated savings', formatEstimatedCostInr(estimatedSavings)],
    ['Billable calls', totals.billable_calls || 0],
    ['Failures / timeouts', `${totals.failures || 0} / ${totals.timeouts || 0}`],
    ['Calls saved', totals.saved_calls || 0]
  ];

  return (
    <Stack spacing={2}>
      <MainCard title="Google Maps Usage Audit">
        <Stack spacing={1.5}>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1} alignItems={{ lg: 'center' }} useFlexGap flexWrap="wrap">
            <TextField type="date" size="small" label="From" InputLabelProps={{ shrink: true }} value={filters.from} onChange={(event) => updateFilter({ from: event.target.value })} />
            <TextField type="date" size="small" label="To" InputLabelProps={{ shrink: true }} value={filters.to} onChange={(event) => updateFilter({ to: event.target.value })} inputProps={{ min: filters.from }} />
            <Button size="small" onClick={() => updateFilter(presetDates(1))}>Today</Button>
            <Button size="small" onClick={() => updateFilter(presetDates(7))}>7 days</Button>
            <Button size="small" onClick={() => updateFilter(presetDates(30))}>30 days</Button>
            <TextField select size="small" label="Product" value={filters.product} onChange={(event) => updateFilter({ product: event.target.value })} sx={{ minWidth: 150 }}>
              {PRODUCTS.map((value) => <MenuItem key={value || 'all'} value={value}>{value || 'All products'}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="Service" value={filters.service} onChange={(event) => updateFilter({ service: event.target.value })} sx={{ minWidth: 175 }}>
              {SERVICES.map((value) => <MenuItem key={value || 'all'} value={value}>{value || 'All services'}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="Result" value={filters.result} onChange={(event) => updateFilter({ result: event.target.value })} sx={{ minWidth: 150 }}>
              {RESULTS.map((value) => <MenuItem key={value || 'all'} value={value}>{value || 'All results'}</MenuItem>)}
            </TextField>
            <Button variant="contained" onClick={load} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</Button>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Estimated application-observed cost in INR. Exchange rate applied: ₹{exchangeRate.rate.toFixed(2)}{exchangeRate.date ? ` (${exchangeRate.date})` : ''} from {exchangeRate.source}. Monthly free caps, India eligibility, volume tiers, subscriptions, taxes and negotiated discounts are not applied.{' '}
            <Link href="https://frankfurter.dev/" target="_blank" rel="noreferrer">Exchange-rate source</Link>{' · '}
            <Link href={GOOGLE_MAPS_PRICING.source} target="_blank" rel="noreferrer">Google pricing</Link>
          </Typography>
        </Stack>
      </MainCard>

      {filters.from > filters.to && <Alert severity="warning">The From date must be before the To date.</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <Grid container spacing={2}>
        {cards.map(([label, value]) => <Grid item xs={12} sm={6} lg={3} key={label}><Card><CardContent><Typography color="text.secondary">{label}</Typography><Typography variant="h3">{value}</Typography></CardContent></Card></Grid>)}
      </Grid>

      <MainCard title="Estimated cost by service">
        <TableContainer><Table size="small">
          <TableHead><TableRow><TableCell>Service / assumed SKU</TableCell><TableCell align="right">Billable events</TableCell><TableCell align="right">INR / 1,000</TableCell><TableCell align="right">Estimated cost</TableCell></TableRow></TableHead>
          <TableBody>{Object.entries(data?.billable_by_service || {}).map(([service, count]) => {
            const pricing = GOOGLE_MAPS_PRICING.services[service];
            const inrPer1000 = (pricing?.usdPer1000 || 0) * exchangeRate.rate;
            return <TableRow key={service}><TableCell>{service}<Typography variant="caption" display="block" color="text.secondary">{pricing?.sku || 'Unpriced service'}</Typography></TableCell><TableCell align="right">{count}</TableCell><TableCell align="right">{formatEstimatedCostInr(inrPer1000)}</TableCell><TableCell align="right">{formatEstimatedCostInr(estimateMapsCostInr({ [service]: count }, exchangeRate.rate))}</TableCell></TableRow>;
          })}</TableBody>
        </Table></TableContainer>
      </MainCard>

      <MainCard title="Recent events">
        <TableContainer sx={{ maxHeight: 520 }}><Table stickyHeader size="small">
          <TableHead><TableRow><TableCell>Time</TableCell><TableCell>Product</TableCell><TableCell>Service</TableCell><TableCell>Flow</TableCell><TableCell>Operation</TableCell><TableCell>Result</TableCell><TableCell align="right">Latency</TableCell></TableRow></TableHead>
          <TableBody>{(data?.events || []).map((event) => <TableRow key={event.id} hover><TableCell>{new Date(event.created_at).toLocaleString()}</TableCell><TableCell>{event.product}</TableCell><TableCell>{event.service}</TableCell><TableCell>{event.flow}</TableCell><TableCell>{event.operation}</TableCell><TableCell><Chip size="small" color={event.result === 'SUCCESS' ? 'success' : event.result === 'FAILURE' || event.result === 'TIMEOUT' ? 'error' : 'default'} label={event.result} /></TableCell><TableCell align="right">{event.latency_ms == null ? '—' : `${event.latency_ms} ms`}</TableCell></TableRow>)}</TableBody>
        </Table></TableContainer>
        <TablePagination component="div" count={data?.meta?.total || 0} page={page} onPageChange={(_event, nextPage) => setPage(nextPage)} rowsPerPage={pageSize} onRowsPerPageChange={(event) => { setPageSize(Number(event.target.value)); setPage(0); }} rowsPerPageOptions={[25, 50, 100]} />
        <Box><Typography variant="caption" color="text.secondary">Refreshes every 60 seconds. Events contain no API keys, addresses, search text, or coordinates.</Typography></Box>
      </MainCard>
    </Stack>
  );
}
