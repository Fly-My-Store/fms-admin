export function getErrorMessage(err, fallback = 'Something went wrong') {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  const data = err?.response?.data;
  if (data?.message) return data.message;
  if (typeof data === 'string') return data;
  if (err?.message) return err.message;
  return fallback;
}
