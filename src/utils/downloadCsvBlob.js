import axiosServices from 'utils/axios';

/** GET a CSV endpoint (filters + page) and trigger a browser download. */
export async function downloadCsvBlob(path, params, fallbackFilename) {
  const r = await axiosServices.get(path, {
    params,
    responseType: 'blob',
    timeout: 120000
  });

  const contentType = String(r.headers?.['content-type'] || '');
  if (contentType.includes('application/json')) {
    const text = await r.data.text();
    let message = 'CSV download failed';
    try {
      message = JSON.parse(text)?.message || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const disposition = r.headers?.['content-disposition'] || r.headers?.['Content-Disposition'] || '';
  const match = /filename="?([^"]+)"?/i.exec(disposition);
  const filename = match?.[1] || fallbackFilename || 'export.csv';

  const blob = new Blob([r.data], { type: 'text/csv; charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
