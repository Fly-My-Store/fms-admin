'use client';

import PropTypes from 'prop-types';
import { MenuItem, Pagination, Stack, TextField, Typography } from '@mui/material';

const DEFAULT_OPTIONS = [10, 20, 50, 100];

/**
 * Shared list footer: rows-per-page + page controls.
 * page is 1-based; pageIndex prop accepted for table compatibility (0-based).
 */
export default function ListPagination({
  page,
  pageIndex,
  pageSize = 20,
  totalPages = 1,
  totalCount,
  onPaginationChange,
  pageSizeOptions = DEFAULT_OPTIONS
}) {
  const currentPage = page != null ? Number(page) : (Number(pageIndex) || 0) + 1;
  const pages = Math.max(1, Number(totalPages) || 1);

  const emit = (nextPage, nextSize = pageSize) => {
    if (typeof onPaginationChange !== 'function') return;
    onPaginationChange({ pageIndex: Math.max(0, nextPage - 1), pageSize: nextSize });
  };

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      alignItems={{ sm: 'center' }}
      justifyContent="space-between"
      sx={{ pt: 1 }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="caption" color="text.secondary">
          Rows per page
        </Typography>
        <TextField
          select
          size="small"
          value={pageSize}
          onChange={(e) => emit(1, Number(e.target.value) || pageSize)}
          sx={{ minWidth: 84 }}
        >
          {pageSizeOptions.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>
        {totalCount != null ? (
          <Typography variant="caption" color="text.secondary">
            {totalCount} total
          </Typography>
        ) : null}
      </Stack>
      <Pagination
        color="primary"
        count={pages}
        page={Math.min(Math.max(1, currentPage), pages)}
        onChange={(_e, p) => emit(p, pageSize)}
        siblingCount={1}
        boundaryCount={1}
        showFirstButton
        showLastButton
      />
    </Stack>
  );
}

ListPagination.propTypes = {
  page: PropTypes.number,
  pageIndex: PropTypes.number,
  pageSize: PropTypes.number,
  totalPages: PropTypes.number,
  totalCount: PropTypes.number,
  onPaginationChange: PropTypes.func,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number)
};
