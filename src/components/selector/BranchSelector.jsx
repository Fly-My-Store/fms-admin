import axios from 'axios';
import PaginatedSelector from './PaginatedSelector';
import axiosServices from 'utils/axios';
import { getBranches } from 'api/location';

const ROOT_URL = process.env.NEXT_PUBLIC_API_URL;

const initialEntityList = {
  items: [],
  totalCount: 0,
  totalPages: 1,
  currentPage: 1,
  perPage: 50
};

export default function BranchSelector({ value, onChange, multiple = false, textFieldProps = {} }) {
  const fetchOptions = async (search, page) => {
    const response = await getBranches({ search, page, limit: 50 })
    const res = response?.data;
    if (!res || !res.data || res.data.length === 0) {
      return initialEntityList;
    }
    return {
      items: res.data,
      totalPages: res.totalPages,
      totalCount: res.totalCount,
      currentPage: res.currentPage,
      perPage: res.perPage
    };
  };

  return (
    <PaginatedSelector
      label="Select Branch"
      multiple={multiple}
      value={value}
      onChange={onChange}
      fetchOptions={fetchOptions}
      initialSelected={value || []}
      textFieldProps={textFieldProps}
    />
  );
}