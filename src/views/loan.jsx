'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LoanTable from 'sections/loan/list/LoanTable';
import { fetchLoansRequest, clearLoan } from 'store/loan/loanSlice';

import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import { DebouncedInput } from 'components/third-party/react-table';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

export default function LoanView() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loans, totalPages, currentPage, perPage, totalCount } = useSelector((state) => state.loan.loansData);

  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [loanStep, setLoanStep] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    dispatch(fetchLoansRequest({ page: pageIndex + 1, limit: perPage, search, step: loanStep || undefined }));
  }, [dispatch, pageIndex, perPage, search, loanStep]);


  const handleAddButton = () => {
    dispatch(clearLoan());
    router.push('/loan/add');
  };

  const handleEditButton = (row) => {
    router.push(`/loan/edit/${row.id}`);
  };

  const handleViewButton = (row) => {
    router.push(`/loan/${row.id}/detail`);
  };

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function'
      ? updater({ pageIndex, pageSize: perPage })
      : updater;
    setPageIndex(next.pageIndex);
  };

  const handleDebouncedSearch = (text) => {
    setSearchText(text);
    if (text.trim().length >= 3 || text === '') {
      setSearch(text.trim());
      setPageIndex(0);
    }
  };

  const topActionsLeft = () => (
    <>
      <DebouncedInput
        value={searchText}
        onFilterChange={handleDebouncedSearch}
        placeholder="Search loans..."
        debounce={500}
        size="small"
      />
      <FormControl size='small' sx={{ minWidth: 140 }}>
        <InputLabel sx={{ marginTop: '4px' }}>Loan Creation Stage</InputLabel>
        <Select
          value={loanStep}
          label="Step"
          onChange={(e) => setLoanStep(e.target.value)}
        >
          <MenuItem value={0}>All</MenuItem>
          {['Draft (Till Loan)', 'Draft (Till Property)', 'Draft (Till Disbursement)', 'Completed']?.map((item, index) => (
            <MenuItem key={index + 1} value={index + 1}>{item}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );

  return (
    <LoanTable
      loans={loans}
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      handleViewButton={handleViewButton}
      pageIndex={pageIndex}
      pageSize={perPage}
      totalPageCount={totalPages}
      onPaginationChange={handlePaginationChange}
      topActionsLeft={topActionsLeft}
      totalCount={totalCount}
    />
  );
}