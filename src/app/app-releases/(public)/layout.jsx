import PropTypes from 'prop-types';
import AppDownloadsLayout from 'layout/AppDownloadsLayout';

export const metadata = {
  title: 'Download apps | Fly My Store',
  description: 'Download the latest Fly My Store customer, seller, and rider Android apps.'
};

export default function Layout({ children }) {
  return <AppDownloadsLayout>{children}</AppDownloadsLayout>;
}

Layout.propTypes = { children: PropTypes.node };
