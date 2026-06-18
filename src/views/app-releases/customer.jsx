'use client';

import AppReleasesSection from 'sections/app-releases/AppReleasesSection';
import { APP_RELEASE_TYPES } from 'api/appReleases';

export default function CustomerAppReleasesView() {
  return (
    <AppReleasesSection
      appType={APP_RELEASE_TYPES.CUSTOMER}
      title="Customer APK releases"
      subtitle="Manage downloadable Android builds for the customer app."
    />
  );
}
