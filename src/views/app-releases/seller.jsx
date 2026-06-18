'use client';

import AppReleasesSection from 'sections/app-releases/AppReleasesSection';
import { APP_RELEASE_TYPES } from 'api/appReleases';

export default function SellerAppReleasesView() {
  return (
    <AppReleasesSection
      appType={APP_RELEASE_TYPES.SELLER}
      title="Seller APK releases"
      subtitle="Manage downloadable Android builds for the seller app."
    />
  );
}
