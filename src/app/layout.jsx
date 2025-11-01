import PropTypes from 'prop-types';

import './globals.css';

// project imports
import ProviderWrapper from './ProviderWrapper';

export const metadata = {
  title: 'Fly My Store Admin',
  description: 'Fly My Store'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ProviderWrapper>{children}</ProviderWrapper>
      </body>
    </html>
  );
}

RootLayout.propTypes = { children: PropTypes.node };
