'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';

/** Must match customer `BANNER_ASPECT` (width / height). App-only; not from API. */
export const BANNER_ASPECT = 3;

const CANVAS_GRADIENT =
  'linear-gradient(135deg, rgb(255,236,210) 0%, rgb(220,236,248) 50%, rgb(251,252,255) 100%)';

function trimText(value) {
  const s = String(value || '').trim();
  return s || null;
}

function placementOf(foregroundUri, imagePlacement) {
  if (!foregroundUri) return 'none';
  const raw = String(imagePlacement || '').trim().toLowerCase();
  if (raw === 'left' || raw === 'right') return raw;
  return 'right';
}

export default function BannerCustomerPreview({
  imageUrl,
  title,
  subtitle,
  actionLabel,
  foregroundImageUrl,
  imagePlacement,
  maxWidth = 320
}) {
  const backgroundUri = trimText(imageUrl);
  const foregroundUri = trimText(foregroundImageUrl);
  const headline = trimText(title);
  const sub = trimText(subtitle);
  const cta = trimText(actionLabel);
  const placement = placementOf(foregroundUri, imagePlacement);
  const copyOnRight = placement === 'left';
  const align = copyOnRight ? 'flex-end' : 'flex-start';
  const textAlign = copyOnRight ? 'right' : 'left';
  const showCopy = Boolean(headline || sub || cta);
  const onPhoto = Boolean(backgroundUri);
  const showScrim = Boolean(onPhoto && showCopy);
  const titleColor = onPhoto ? '#fff' : '#005CA8';
  const subtitleColor = onPhoto ? '#fff' : 'rgb(98,108,124)';

  return (
    <Stack spacing={0.75} sx={{ width: '100%', maxWidth }}>
      <Typography variant="caption" color="text.secondary">
        Customer app preview (3:1)
      </Typography>
      <Box
        sx={{
          width: '100%',
          aspectRatio: `${BANNER_ASPECT} / 1`,
          borderRadius: 1.5,
          overflow: 'hidden',
          position: 'relative',
          bgcolor: 'rgb(220,236,248)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.18)'
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, background: CANVAS_GRADIENT }} />
        {!onPhoto ? (
          <>
            <Box
              sx={{
                position: 'absolute',
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'rgba(255,140,0,0.18)',
                top: -16,
                right: -20
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                width: 50,
                height: 50,
                borderRadius: '50%',
                bgcolor: 'rgba(0,112,184,0.14)',
                bottom: -12,
                left: -16
              }}
            />
          </>
        ) : null}
        {backgroundUri ? (
          <Box
            component="img"
            src={backgroundUri}
            alt=""
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        ) : null}
        {showScrim ? (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'rgba(0, 0, 0, 0.55)'
            }}
          />
        ) : null}
        {showCopy || foregroundUri ? (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: copyOnRight ? 'row-reverse' : 'row',
              alignItems: 'stretch',
              px: 2,
              py: 1.5,
              gap: 1.5
            }}
          >
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: align,
                gap: 1
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: align,
                  gap: 0.5
                }}
              >
                {headline ? (
                  <Typography
                    noWrap
                    sx={{
                      color: titleColor,
                      fontWeight: onPhoto ? 700 : 800,
                      fontSize: 14,
                      lineHeight: 1.2,
                      width: '100%',
                      textAlign
                    }}
                  >
                    {headline}
                  </Typography>
                ) : null}
                {sub ? (
                  <Typography
                    noWrap
                    sx={{
                      color: subtitleColor,
                      fontWeight: 500,
                      fontSize: 12,
                      lineHeight: 1.2,
                      opacity: onPhoto ? 0.92 : 1,
                      width: '100%',
                      textAlign
                    }}
                  >
                    {sub}
                  </Typography>
                ) : null}
              </Box>
              {cta ? (
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: '#0070B8',
                    alignSelf: align
                  }}
                >
                  <Typography noWrap sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>
                    {cta}
                  </Typography>
                </Box>
              ) : null}
            </Box>
            {foregroundUri ? (
              <Box
                component="img"
                src={foregroundUri}
                alt=""
                sx={{
                  width: '28%',
                  height: '78%',
                  objectFit: 'contain',
                  flexShrink: 0,
                  alignSelf: 'center'
                }}
              />
            ) : null}
          </Box>
        ) : null}
      </Box>
    </Stack>
  );
}

BannerCustomerPreview.propTypes = {
  imageUrl: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  actionLabel: PropTypes.string,
  foregroundImageUrl: PropTypes.string,
  imagePlacement: PropTypes.string,
  maxWidth: PropTypes.number
};
