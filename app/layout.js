import './globals.css';
import Providers from '../lib/Providers';

export const metadata = {
  title: 'FMS Admin',
  description: 'Admin dashboard for Fly My Store',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
