'use client';

import PropTypes from 'prop-types';
import { Alert } from '@mui/material';

const LABELS = {
  'product-attributes': 'Product attributes',
  'variant-attributes': 'Variant attributes',
  'attribute-groups': 'Attribute groups',
  'plp-configs': 'PLP configs'
};

export default function OutOfScopeAttributeNotice({ feature }) {
  const label = LABELS[feature] || feature;

  return (
    <Alert severity="warning" sx={{ mb: 2 }}>
      <strong>{label}</strong> are out of scope and not used in production. Use product <strong>spec_json</strong> and
      variant <strong>option_signature</strong> instead. Do not add new data here.
    </Alert>
  );
}

OutOfScopeAttributeNotice.propTypes = {
  feature: PropTypes.oneOf(['product-attributes', 'variant-attributes', 'attribute-groups', 'plp-configs']).isRequired
};
