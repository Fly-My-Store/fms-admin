'use client';

import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Typography
} from '@mui/material';
import MainCard from 'components/MainCard';
import useConfig from 'hooks/useConfig';

export default function ProfileSettingsTab() {
  const {
    mode,
    onChangeMode,
    container,
    onChangeContainer,
    miniDrawer,
    onChangeMiniDrawer
  } = useConfig();

  return (
    <MainCard title="Settings" border={false} boxShadow>
      <Stack spacing={3} sx={{ maxWidth: 520 }}>
        <Typography variant="body2" color="text.secondary">
          Appearance and layout preferences for this browser.
        </Typography>

        <Stack sx={{ gap: 1 }}>
          <InputLabel>Theme mode</InputLabel>
          <FormControl size="small" fullWidth>
            <Select value={mode} onChange={(e) => onChangeMode(e.target.value)}>
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <FormControlLabel
          control={<Switch checked={container} onChange={(e) => onChangeContainer(e.target.checked)} />}
          label="Content max width (container)"
        />

        <FormControlLabel
          control={<Switch checked={miniDrawer} onChange={(e) => onChangeMiniDrawer(e.target.checked)} />}
          label="Collapsed sidebar"
        />
      </Stack>
    </MainCard>
  );
}
