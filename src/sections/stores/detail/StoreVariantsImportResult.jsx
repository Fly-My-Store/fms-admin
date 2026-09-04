'use client';

import PropTypes from 'prop-types';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';

function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/csv; charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function StoreVariantsImportResult({ result, onDismiss, embedded = false }) {
  if (!result?.summary) return null;

  const { summary, rows = [], error_csv: errorCsv } = result;
  const failed = summary.failed || 0;
  const created = summary.created || 0;
  const updated = summary.updated || 0;
  const isUpdate = summary.updated != null;
  const okCount = isUpdate ? updated : created;
  const severity = failed > 0 ? 'warning' : 'success';
  const errorFile = isUpdate ? 'store-listing-update-errors.csv' : 'store-listing-import-errors.csv';

  const body = (
    <Stack spacing={2}>
      <Alert
        severity={severity}
        onClose={embedded && onDismiss ? () => onDismiss() : undefined}
      >
        {failed > 0
          ? `${okCount} row(s) succeeded. ${failed} row(s) failed — fix and re-upload the errors CSV.`
          : isUpdate
            ? `All ${updated} listing(s) updated successfully.`
            : `All ${created} SKU(s) listed successfully.`}
        {errorCsv ? (
          <Button
            size="small"
            sx={{ ml: 1 }}
            onClick={() => downloadText(errorFile, errorCsv)}
          >
            Download errors CSV
          </Button>
        ) : null}
      </Alert>

      {rows.length > 0 ? (
        <Paper variant="outlined" sx={{ overflow: 'auto', maxHeight: 320 }}>
          <Typography variant="subtitle2" sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
            Failed rows
          </Typography>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Row</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Error</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={`${r.row}-${r.id || r.sku}`}>
                  <TableCell>{r.row}</TableCell>
                  <TableCell>{r.sku || r.id || '—'}</TableCell>
                  <TableCell sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{r.error}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      ) : null}
    </Stack>
  );

  if (embedded) return body;

  return (
    <MainCard
      title={isUpdate ? 'Last bulk update' : 'Last bulk import'}
      subheader={
        isUpdate
          ? `${updated} updated · ${failed} failed · ${summary.total} total`
          : `${created} listed · ${failed} failed · ${summary.total} total`
      }
      secondary={
        onDismiss ? (
          <Button size="small" onClick={onDismiss}>
            Dismiss
          </Button>
        ) : null
      }
    >
      {body}
    </MainCard>
  );
}

StoreVariantsImportResult.propTypes = {
  result: PropTypes.shape({
    summary: PropTypes.object,
    rows: PropTypes.array,
    error_csv: PropTypes.string
  }),
  onDismiss: PropTypes.func,
  embedded: PropTypes.bool
};
