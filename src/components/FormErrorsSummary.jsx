'use client';

import PropTypes from 'prop-types';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { formatErrorEntries } from 'utils/formErrors';

export default function FormErrorsSummary({ errors, title = 'Please fix the following fields' }) {
  const entries = formatErrorEntries(errors);
  if (!entries.length) return null;

  return (
    <Alert severity="error">
      <Stack spacing={0.75}>
        <Typography variant="subtitle2">{title}</Typography>
        <Stack component="ul" spacing={0.25} sx={{ m: 0, pl: 2.5 }}>
          {entries.map((entry) => (
            <Typography key={entry.key} component="li" variant="body2">
              <strong>{entry.label}:</strong> {entry.message}
            </Typography>
          ))}
        </Stack>
      </Stack>
    </Alert>
  );
}

FormErrorsSummary.propTypes = {
  errors: PropTypes.object,
  title: PropTypes.string,
};
