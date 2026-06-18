'use client';

import AppReleasesSection from 'sections/app-releases/AppReleasesSection';
import { APP_RELEASE_TYPES } from 'api/appReleases';

export default function RiderAppReleasesView() {
  return (
    <AppReleasesSection
      appType={APP_RELEASE_TYPES.RIDER}
      title="Rider APK releases"
      subtitle="Manage downloadable Android builds for the delivery (rider) app."
    />
  );
}
