import PropTypes from 'prop-types';

import AppDownloadsLayout from 'layout/AppDownloadsLayout';

export default function Layout({ children }) {
  return <AppDownloadsLayout>{children}</AppDownloadsLayout>;
}

Layout.propTypes = { children: PropTypes.node };
