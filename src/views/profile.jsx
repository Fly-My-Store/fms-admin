'use client';

import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Grid from '@mui/material/Grid2';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import ProfileTabList from 'sections/profile/ProfileTabList';
import ProfilePersonalTab from 'sections/profile/ProfilePersonalTab';
import ProfilePasswordTab from 'sections/profile/ProfilePasswordTab';
import ProfileSettingsTab from 'sections/profile/ProfileSettingsTab';
import { handlerActiveItem, useGetMenuMaster } from 'api/menu';

const VALID_TABS = new Set(['personal', 'password', 'settings']);

const TAB_HEADINGS = {
  personal: 'Personal information',
  password: 'Change password',
  settings: 'Settings'
};

export default function UserProfile({ tab }) {
  const router = useRouter();
  const { menuMaster } = useGetMenuMaster();
  const openedItem = menuMaster.openedItem;

  const activeTab = VALID_TABS.has(tab) ? tab : 'personal';

  useEffect(() => {
    if (openedItem !== 'user-profile') handlerActiveItem('user-profile');
  }, [openedItem]);

  useEffect(() => {
    if (!VALID_TABS.has(tab)) {
      router.replace('/profile/personal');
    }
  }, [tab, router]);

  const breadcrumb = {
    heading: 'My profile',
    links: [
      { title: 'home', to: '/dashboard' },
      { title: TAB_HEADINGS[activeTab] || 'Profile', i18n: false }
    ]
  };

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <ProfileTabList activeTab={activeTab} />
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          {activeTab === 'personal' && <ProfilePersonalTab />}
          {activeTab === 'password' && <ProfilePasswordTab />}
          {activeTab === 'settings' && <ProfileSettingsTab />}
        </Grid>
      </Grid>
    </>
  );
}

UserProfile.propTypes = { tab: PropTypes.string };
