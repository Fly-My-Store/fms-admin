'use client';

import PropTypes from 'prop-types';
import { useRouter } from 'next/navigation';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MainCard from 'components/MainCard';
import UserOutlined from '@ant-design/icons/UserOutlined';
import LockOutlined from '@ant-design/icons/LockOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';

const TABS = [
  { key: 'personal', label: 'Personal information', icon: UserOutlined },
  { key: 'password', label: 'Change password', icon: LockOutlined },
  { key: 'settings', label: 'Settings', icon: SettingOutlined }
];

export default function ProfileTabList({ activeTab }) {
  const router = useRouter();

  return (
    <MainCard border={false} boxShadow>
      <List component="nav" sx={{ p: 0.5, '& .MuiListItemIcon-root': { minWidth: 36 } }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const selected = activeTab === tab.key;
          return (
            <ListItemButton
              key={tab.key}
              selected={selected}
              onClick={() => router.push(`/profile/${tab.key}`)}
              sx={{ borderRadius: 1, mb: 0.5 }}
            >
              <ListItemIcon>
                <Icon />
              </ListItemIcon>
              <ListItemText primary={tab.label} />
            </ListItemButton>
          );
        })}
      </List>
    </MainCard>
  );
}

ProfileTabList.propTypes = {
  activeTab: PropTypes.string.isRequired
};
