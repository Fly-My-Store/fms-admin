// ==============================|| ICON IMPORTS ||============================== //
import {
  DashboardOutlined,
  UserOutlined,
  LockOutlined,
  TeamOutlined,
  SettingOutlined,
  ClusterOutlined,
  ApartmentOutlined,
  BuildOutlined,
  LineChartOutlined,
  CreditCardOutlined,
  HomeOutlined,
  TrademarkCircleOutlined,
  AimOutlined
} from '@ant-design/icons';

// ==============================|| ICON MAPPING ||============================== //
const icons = {
  DashboardOutlined,
  UserOutlined,
  LockOutlined,
  TeamOutlined,
  SettingOutlined,
  ClusterOutlined,
  ApartmentOutlined,
  BuildOutlined,
  LineChartOutlined,
  CreditCardOutlined,
  HomeOutlined,
  TrademarkCircleOutlined,
  AimOutlined
};

// ==============================|| MENU ITEMS - BUSINESS USER ||============================== //
// Items without `perm` show to any authenticated business user.

const businessMenu = {
  id: 'business',
  title: '',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'dashboard',
      type: 'item',
      url: '/dashboard',
      icon: icons.DashboardOutlined
      // no perm
    },
    {
      id: 'loan',
      title: 'loan',
      type: 'item',
      url: '/loan',
      icon: icons.CreditCardOutlined,
      perm: 'loan',
      action: 'read'
    },
    {
      id: 'geo-map',
      title: 'geo-map',
      type: 'item',
      url: '/geo-map',
      icon: icons.CreditCardOutlined,
      // gate on branches (or use 'loanProperty' if you prefer)
      perm: 'branch',
      action: 'read'
    },
    {
      id: 'settings',
      title: 'settings',
      type: 'collapse',
      icon: icons.SettingOutlined,
      children: [
        {
          id: 'roles',
          title: 'roles',
          type: 'item',
          url: '/roles',
          perm: 'role',
          action: 'read'
        },
        {
          id: 'members',
          title: 'users',
          type: 'item',
          url: '/members',
          perm: 'user',
          action: 'read'
        },
        {
          id: 'geolocations',
          title: 'geolocations',
          type: 'collapse',
          children: [
            {
              id: 'states',
              title: 'states',
              type: 'item',
              url: '/states',
              perm: 'state',
              action: 'read'
            },
            {
              id: 'districts',
              title: 'districts',
              type: 'item',
              url: '/districts',
              perm: 'district',
              action: 'read'
            },
            {
              id: 'cities',
              title: 'cities',
              type: 'item',
              url: '/cities',
              perm: 'city',
              action: 'read'
            },
            {
              id: 'zones',
              title: 'zones',
              type: 'item',
              url: '/zones',
              perm: 'zone',
              action: 'read'
            }
          ]
        },
        {
          id: 'branches',
          title: 'branches',
          type: 'item',
          url: '/branches',
          perm: 'branch',
          action: 'read'
        },
        {
          id: 'business-configuration',
          title: 'business-configuration',
          type: 'item',
          url: '/business-configuration',
          perm: 'businessConfiguration',
          action: 'read'
        },
        {
          id: 'construction-plan',
          title: 'construction-plan',
          type: 'item',
          url: '/construction-plan-config',
          perm: 'constructionPlanConfig',
          action: 'read'
        }
      ]
    }
  ]
};

export default businessMenu;