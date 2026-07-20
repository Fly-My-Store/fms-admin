import { redirect } from 'next/navigation';
import { ROUTES } from 'utils/constants';

/** Home → login. Avoids duplicate GuestGuard+Login on `/` (also helps after stale CDN/nginx HTML cache). */
export default function HomePage() {
  redirect(ROUTES.LOGIN);
}
