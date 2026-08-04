'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import useAxiosPaginatedList from 'hooks/useAxiosPaginatedList';
import useUrlFilters from 'hooks/useUrlFilters';
import UserTableSection from 'sections/users/UserTableSection';
import UserFormDialog from 'sections/users/UserFormDialog';
import { ACCOUNT_STATUS } from 'utils/constants';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: String(ACCOUNT_STATUS.ACTIVE), label: 'Active' },
  { value: String(ACCOUNT_STATUS.INACTIVE), label: 'Inactive' },
  { value: String(ACCOUNT_STATUS.SUSPENDED), label: 'Suspended' },
  { value: String(ACCOUNT_STATUS.DELETED), label: 'Deleted' }
];

const TESTER_FILTER_OPTIONS = [
  { value: 'false', label: 'Live' },
  { value: 'true', label: 'Testers' },
  { value: 'all', label: 'All' }
];

const FILTER_DEFAULTS = {
  q: '',
  status: 'all',
  is_tester: 'false',
  page: 1,
  limit: 20
};

export default function UsersView() {
  const actorIsTester = useSelector((s) => Boolean(s.auth?.user?.is_tester));
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { draft, setDraft, applied, applySearch, handlePaginationChange, urlKey } = useUrlFilters({
    defaults: FILTER_DEFAULTS
  });
  const [searchQuery, setSearchQuery] = useState(draft.q || '');

  const listParams = useMemo(() => {
    const params = {
      type: 'ADMIN',
      ...(applied.q ? { q: applied.q } : {}),
      ...(applied.status && applied.status !== 'all' ? { status: applied.status } : {})
    };
    if (!actorIsTester) {
      if (applied.is_tester && applied.is_tester !== 'all') params.is_tester = applied.is_tester;
    }
    return params;
  }, [applied.q, applied.status, applied.is_tester, actorIsTester]);

  const { rows, totalPages, totalCount, loading, load, setPageIndex, setPageSize } = useAxiosPaginatedList(
    'admin/iam/users',
    { params: listParams, errorMessage: 'Failed to load admin users' }
  );

  useEffect(() => {
    setSearchQuery(applied.q || '');
    setPageIndex((Number(applied.page) || 1) - 1);
    setPageSize(Number(applied.limit) || 20);
  }, [urlKey, applied.q, applied.page, applied.limit, setPageIndex, setPageSize]);

  const handleSearch = () => {
    applySearch({
      q: searchQuery.trim(),
      status: draft.status,
      is_tester: draft.is_tester
    });
  };

  const topActionsLeft = () => (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }} useFlexGap flexWrap="wrap">
      <TextField
        size="small"
        label="Search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Name, email, phone…"
        sx={{ minWidth: 220 }}
      />
      <TextField
        select
        size="small"
        label="Status"
        value={draft.status}
        onChange={(e) => setDraft({ status: e.target.value })}
        sx={{ minWidth: 140 }}
      >
        {STATUS_OPTIONS.map((o) => (
          <MenuItem key={o.value} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </TextField>
      {!actorIsTester && (
        <TextField
          select
          size="small"
          label="Scope"
          value={draft.is_tester}
          onChange={(e) => setDraft({ is_tester: e.target.value })}
          sx={{ minWidth: 120 }}
        >
          {TESTER_FILTER_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
      )}
      <Button variant="contained" size="small" onClick={handleSearch} disabled={loading}>
        Search
      </Button>
    </Stack>
  );

  return (
    <>
      <UserTableSection
        users={rows}
        handleAddButton={() => {
          setSelectedUser(null);
          setOpen(true);
        }}
        handleEditButton={(row) => {
          setSelectedUser(row);
          setOpen(true);
        }}
        pageIndex={(Number(applied.page) || 1) - 1}
        pageSize={Number(applied.limit) || 20}
        totalPageCount={totalPages}
        totalCount={totalCount}
        onPaginationChange={handlePaginationChange}
        topActionsLeft={topActionsLeft}
      />
      <UserFormDialog
        open={open}
        onClose={() => {
          setOpen(false);
          setSelectedUser(null);
        }}
        initialData={selectedUser}
        onSaved={load}
      />
    </>
  );
}
