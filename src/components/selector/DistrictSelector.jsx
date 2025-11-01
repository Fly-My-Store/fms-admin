import axios from 'axios';
import PaginatedSelector from './PaginatedSelector';
import axiosServices from 'utils/axios';
import { getDistricts } from 'api/location';

const ROOT_URL = process.env.NEXT_PUBLIC_API_URL;

const initialEntityList = {
  items: [],
  totalCount: 0,
  totalPages: 1,
  currentPage: 1,
  perPage: 50
};

export default function DistrictSelector({ value, onChange, multiple = false, textFieldProps = {} }) {
  const fetchOptions = async (search, page) => {
    const response = await getDistricts({ search, page, limit: 50 })
    const res = response?.data;
    if (!res || !res.data || res.data.length === 0) {
      return initialEntityList;
    }
    return {
      items: res.data.map((s) => ({ id: s.id, name: s.name })),
      totalPages: res.totalPages,
      totalCount: res.totalCount,
      currentPage: res.currentPage,
      perPage: res.perPage
    };
  };

  return (
    <PaginatedSelector
      label="Select District"
      multiple={multiple}
      value={value}
      onChange={onChange}
      fetchOptions={fetchOptions}
      initialSelected={value || []}
      textFieldProps={textFieldProps}
    />
  );
}