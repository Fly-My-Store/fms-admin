import * as yup from 'yup';

export const formatCurrency = (value) => {
  if (value === '' || value === null || value === undefined) return '';
  const num = parseFloat(value.toString().replace(/,/g, ''));
  if (isNaN(num)) return '';
  return num.toLocaleString('en-IN');
};

export const parseCurrency = (value) => {
  return value ? value.toString().replace(/,/g, '') : '';
};

export const isFormattedNumber = (label) =>
  yup
    .string()
    .required(`${label} is required`)
    .test('is-valid-number', `Invalid ${label}`, (value) => {
      if (!value) return false;
      const num = parseFloat(value.replace(/,/g, ''));
      return !isNaN(num);
    });
