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

export default function StoreVariantsImportResult({ result, onDismiss }) {
  if (!result?.summary) return null;

  const { summary, rows = [], error_csv: errorCsv } = result;
  const failed = summary.failed || 0;
  const created = summary.created || 0;
  const severity = failed > 0 ? 'warning' : 'success';

  return (
    <MainCard
      title="Last bulk import"
      subheader={`${created} listed · ${failed} failed · ${summary.total} total`}
      secondary={
        onDismiss ? (
          <Button size="small" onClick={onDismiss}>
            Dismiss
          </Button>
        ) : null
      }
    >
      <Stack spacing={2}>
        <Alert severity={severity}>
          {failed > 0
            ? `${created} SKU(s) listed successfully. ${failed} row(s) failed — fix and re-upload the errors CSV.`
            : `All ${created} SKU(s) listed successfully.`}
          {errorCsv ? (
            <Button
              size="small"
              sx={{ ml: 1 }}
              onClick={() => downloadText('store-listing-import-errors.csv', errorCsv)}
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
                  <TableRow key={`${r.row}-${r.sku}`}>
                    <TableCell>{r.row}</TableCell>
                    <TableCell>{r.sku}</TableCell>
                    <TableCell sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{r.error}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        ) : null}
      </Stack>
    </MainCard>
  );
}

StoreVariantsImportResult.propTypes = {
  result: PropTypes.shape({
    summary: PropTypes.object,
    rows: PropTypes.array,
    error_csv: PropTypes.string
  }),
  onDismiss: PropTypes.func
};
