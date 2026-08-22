'use client';

import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import MainCard from 'components/MainCard';
import ListPagination from 'components/list/ListPagination';
import useUrlFilters from 'hooks/useUrlFilters';
import { RECORD_STATUS } from 'utils/constants';

const DEFAULT_PAGE_SIZE = 20;

const FILTER_DEFAULTS = {
  q: '',
  page: 1,
  limit: DEFAULT_PAGE_SIZE
};

function parsePagedResponse(resp) {
  const meta = resp?.meta || {};
  const raw = resp?.data ?? resp?.rows ?? resp;
  const list = Array.isArray(raw) ? raw : Array.isArray(raw?.rows) ? raw.rows : [];
  const total = Number(meta.total);
  return {
    list,
    total: Number.isFinite(total) ? total : list.length,
    pageSize: Number(meta.pageSize) || undefined
  };
}

function purgeCount(resp) {
  return Number(resp?.data?.purged ?? resp?.purged ?? 0);
}

/**
 * Generic pending approval list (record_status = INACTIVE).
 */
export default function CatalogPendingList({
  title,
  loadRows,
  approveOne,
  approveBulk,
  purgeOne,
  purgeBulk,
  purgeAll,
  editPath,
  columns,
  searchPlaceholder = 'Search…'
}) {
  const router = useRouter();
  const { draft, applied, applySearch, handlePaginationChange, urlKey } = useUrlFilters({
    defaults: FILTER_DEFAULTS
  });
  const [searchQuery, setSearchQuery] = useState(draft.q || '');
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const [purging, setPurging] = useState(false);

  const page = Number(applied.page) || 1;
  const pageSize = Number(applied.limit) || DEFAULT_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const canPurge = Boolean(purgeOne && purgeBulk && purgeAll);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await loadRows({
        page,
        limit: pageSize,
        record_status: RECORD_STATUS.INACTIVE,
        ...(applied.q ? { q: applied.q } : {})
      });
      const { list, total: nextTotal } = parsePagedResponse(resp);
      const maxPage = Math.max(1, Math.ceil(nextTotal / pageSize) || 1);

      if (page > maxPage) {
        setTotal(nextTotal);
        setSelected([]);
        handlePaginationChange({ pageIndex: maxPage - 1, pageSize });
        return;
      }

      setRows(list);
      setTotal(nextTotal);
      setSelected([]);
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || err?.message || 'Failed to load', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [loadRows, page, pageSize, applied.q, handlePaginationChange]);

  useEffect(() => {
    refresh();
  }, [refresh, urlKey]);

  useEffect(() => {
    setSearchQuery(applied.q || '');
  }, [applied.q]);

  const toggle = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    if (selected.length === rows.length) setSelected([]);
    else setSelected(rows.map((r) => r.id));
  };

  const handleApprove = async (id) => {
    try {
      await approveOne(id);
      enqueueSnackbar('Approved', { variant: 'success' });
      refresh();
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || err?.message || 'Approve failed', { variant: 'error' });
    }
  };

  const handleBulk = async () => {
    if (!selected.length) return;
    try {
      await approveBulk(selected);
      enqueueSnackbar(`Approved ${selected.length}`, { variant: 'success' });
      refresh();
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || err?.message || 'Bulk approve failed', { variant: 'error' });
    }
  };

  const runPurge = async () => {
    if (!confirm) return;
    setPurging(true);
    try {
      let resp;
      if (confirm.mode === 'one') {
        resp = await purgeOne(confirm.id);
      } else if (confirm.mode === 'selected') {
        resp = await purgeBulk(selected);
      } else {
        resp = await purgeAll();
      }
      const count = confirm.mode === 'one' ? 1 : purgeCount(resp) || (confirm.mode === 'selected' ? selected.length : confirm.count);
      enqueueSnackbar(`Permanently deleted ${count} item${count === 1 ? '' : 's'}`, { variant: 'success' });
      setConfirm(null);
      refresh();
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || err?.message || 'Delete failed', { variant: 'error' });
    } finally {
      setPurging(false);
    }
  };

  const confirmMessage = () => {
    if (!confirm) return '';
    if (confirm.mode === 'one') {
      return 'Permanently delete this pending item from the database? This cannot be undone.';
    }
    if (confirm.mode === 'selected') {
      return `Permanently delete ${selected.length} selected pending item${selected.length === 1 ? '' : 's'} from the database? This cannot be undone.`;
    }
    return `Permanently delete all ${confirm.count} pending items from the database? This cannot be undone.`;
  };

  const handleSearch = () => {
    applySearch({ q: searchQuery.trim() });
  };

  const headerActions = (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      sx={{ gap: 1, alignItems: { xs: 'stretch', md: 'center' }, flexWrap: 'wrap' }}
    >
      <TextField
        size="small"
        label="Search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder={searchPlaceholder}
        sx={{ minWidth: 220 }}
      />
      <Button variant="outlined" size="small" onClick={handleSearch} disabled={loading}>
        Search
      </Button>
      {loading ? <CircularProgress size={18} /> : null}
      <Button variant="outlined" size="small" disabled={!selected.length || loading} onClick={handleBulk}>
        Approve selected ({selected.length})
      </Button>
      {canPurge ? (
        <>
          <Button
            variant="outlined"
            color="error"
            size="small"
            disabled={!selected.length || loading || purging}
            onClick={() => setConfirm({ mode: 'selected' })}
          >
            Delete selected ({selected.length})
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            disabled={!total || loading || purging}
            onClick={() => setConfirm({ mode: 'all', count: total })}
          >
            Delete all pending ({total})
          </Button>
        </>
      ) : null}
    </Stack>
  );

  return (
    <>
      <MainCard title={title} secondary={headerActions}>
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ overflow: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < rows.length}
                      checked={rows.length > 0 && selected.length === rows.length}
                      onChange={toggleAll}
                      disabled={loading || rows.length === 0}
                    />
                  </TableCell>
                  {columns.map((c) => (
                    <TableCell key={c.key}>{c.header}</TableCell>
                  ))}
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!loading && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={columns.length + 2}>
                      <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                        No pending items
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox checked={selected.includes(row.id)} onChange={() => toggle(row.id)} />
                    </TableCell>
                    {columns.map((c) => (
                      <TableCell key={c.key}>{c.render ? c.render(row) : row[c.key]}</TableCell>
                    ))}
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button size="small" variant="contained" onClick={() => handleApprove(row.id)}>
                          Approve
                        </Button>
                        <Button size="small" variant="outlined" onClick={() => router.push(editPath(row))}>
                          Edit
                        </Button>
                        {canPurge ? (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            disabled={purging}
                            onClick={() => setConfirm({ mode: 'one', id: row.id })}
                          >
                            Delete
                          </Button>
                        ) : null}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
          <ListPagination
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            totalCount={total}
            onPaginationChange={handlePaginationChange}
          />
        </Stack>
      </MainCard>

      <Dialog open={Boolean(confirm)} onClose={() => !purging && setConfirm(null)}>
        <DialogTitle>Permanently delete?</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmMessage()}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)} disabled={purging}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={runPurge} disabled={purging}>
            {purging ? 'Deleting…' : 'Delete permanently'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

CatalogPendingList.propTypes = {
  title: PropTypes.string.isRequired,
  loadRows: PropTypes.func.isRequired,
  approveOne: PropTypes.func.isRequired,
  approveBulk: PropTypes.func.isRequired,
  purgeOne: PropTypes.func,
  purgeBulk: PropTypes.func,
  purgeAll: PropTypes.func,
  editPath: PropTypes.func.isRequired,
  columns: PropTypes.array.isRequired,
  searchPlaceholder: PropTypes.string
};

export function Thumb({ url, alt }) {
  if (!url) return null;
  return <Avatar src={url} alt={alt || ''} variant="rounded" sx={{ width: 40, height: 40 }} />;
}

Thumb.propTypes = {
  url: PropTypes.string,
  alt: PropTypes.string
};
