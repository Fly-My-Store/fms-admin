export function headerIconSx(active) {
  return (theme) => ({
    color: 'text.primary',
    bgcolor: active ? 'grey.100' : 'transparent',
    ...theme.applyStyles('dark', { bgcolor: active ? 'background.default' : 'transparent' })
  });
}
