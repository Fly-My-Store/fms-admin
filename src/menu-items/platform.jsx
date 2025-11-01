// ==============================|| ICON IMPORTS ||============================== //
import {
  DashboardOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  AppstoreOutlined,
  PictureOutlined,
  StarOutlined,
  ShopOutlined,
  TeamOutlined,
  UserOutlined,
  LockOutlined,
  SettingOutlined,
  ClusterOutlined,
  LineChartOutlined,
  CreditCardOutlined,
  DatabaseOutlined,
  SyncOutlined,
  EnvironmentOutlined,
  CarOutlined,
  AimOutlined,
  FileSearchOutlined,
  ReloadOutlined,
  BellOutlined
} from '@ant-design/icons';

// ==============================|| ICON MAPPING ||============================== //
const icons = {
  DashboardOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  AppstoreOutlined,
  PictureOutlined,
  StarOutlined,
  ShopOutlined,
  TeamOutlined,
  UserOutlined,
  LockOutlined,
  SettingOutlined,
  ClusterOutlined,
  LineChartOutlined,
  CreditCardOutlined,
  DatabaseOutlined,
  SyncOutlined,
  EnvironmentOutlined,
  CarOutlined,
  AimOutlined,
  FileSearchOutlined,
  ReloadOutlined,
  BellOutlined
};

// ==============================|| MENU ITEMS - FLY MY STORE (PLATFORM) ||============================== //
// NOTE: Use `perm` (table/entity) + `action` ('create'|'read'|'modify'|'delete') to gate visibility.
// Items without `perm` show to any authenticated platform user (server still enforces route-level ACL).

const platformMenu = {
  id: 'platform-admin',
  title: '',
  type: 'group',
  children: [
    // ----- Dashboard -----
    {
      id: 'dashboard',
      title: 'dashboard',
      type: 'item',
      url: '/dashboard',
      icon: icons.DashboardOutlined
    },

    // ----- Catalog -----
    {
      id: 'catalog',
      title: 'catalog',
      type: 'collapse',
      icon: icons.ShoppingOutlined,
      children: [
        {
          id: 'categories',
          title: 'categories',
          type: 'item',
          url: '/categories',
          icon: icons.ClusterOutlined,
          perm: 'category',
          action: 'read'
        },
        {
          id: 'brands',
          title: 'brands',
          type: 'item',
          url: '/brands',
          icon: icons.TagsOutlined,
          perm: 'brand',
          action: 'read'
        },
        {
          id: 'products',
          title: 'products',
          type: 'item',
          url: '/products',
          icon: icons.AppstoreOutlined,
          perm: 'product',
          action: 'read'
        },
        {
          id: 'product-options',
          title: 'product-options',
          type: 'item',
          url: '/product-options',
          icon: icons.SettingOutlined, // alias via SettingOutlined if you prefer
          perm: 'productOption',
          action: 'read'
        },
        {
          id: 'product-variants',
          title: 'product-variants',
          type: 'item',
          url: '/product-variants',
          icon: icons.ReloadOutlined,
          perm: 'productVariant',
          action: 'read'
        },
        {
          id: 'images',
          title: 'images',
          type: 'item',
          url: '/images',
          icon: icons.PictureOutlined,
          perm: 'productImage',
          action: 'read'
        }
      ]
    },

    // ----- Merchants & Stores -----
    {
      id: 'merchants-stores',
      title: 'merchants-stores',
      type: 'collapse',
      icon: icons.ShopOutlined,
      children: [
        {
          id: 'merchants',
          title: 'merchants',
          type: 'item',
          url: '/merchants',
          icon: icons.TeamOutlined,
          perm: 'merchant',
          action: 'read'
        },
        {
          id: 'stores',
          title: 'stores',
          type: 'item',
          url: '/stores',
          icon: icons.ShopOutlined,
          perm: 'store',
          action: 'read'
        },
        {
          id: 'store-products',
          title: 'store-products',
          type: 'item',
          url: '/store-products',
          icon: icons.DatabaseOutlined,
          perm: 'storeProduct',
          action: 'read'
        },
        {
          id: 'store-variants',
          title: 'store-variants',
          type: 'item',
          url: '/store-variants',
          icon: icons.SyncOutlined,
          perm: 'storeVariant',
          action: 'read'
        },
        {
          id: 'inventory-movements',
          title: 'inventory-movements',
          type: 'item',
          url: '/inventory-movements',
          icon: icons.FileSearchOutlined,
          perm: 'inventoryMovement',
          action: 'read'
        }
      ]
    },

    // ----- Orders & Customers -----
    {
      id: 'orders',
      title: 'orders',
      type: 'collapse',
      icon: icons.ShoppingCartOutlined,
      children: [
        {
          id: 'orders-list',
          title: 'orders',
          type: 'item',
          url: '/orders',
          icon: icons.ShoppingCartOutlined,
          perm: 'order',
          action: 'read'
        },
        {
          id: 'order-events',
          title: 'order-events',
          type: 'item',
          url: '/order-events',
          icon: icons.ReloadOutlined,
          perm: 'orderEvent',
          action: 'read'
        },
        {
          id: 'customers',
          title: 'customers',
          type: 'item',
          url: '/customers',
          icon: icons.UserOutlined,
          perm: 'user',
          action: 'read'
        }
      ]
    },

    // ----- Payments -----
    {
      id: 'payments',
      title: 'payments',
      type: 'collapse',
      icon: icons.CreditCardOutlined,
      children: [
        {
          id: 'payments-list',
          title: 'payments',
          type: 'item',
          url: '/payments',
          icon: icons.CreditCardOutlined,
          perm: 'payment',
          action: 'read'
        },
        {
          id: 'refunds',
          title: 'refunds',
          type: 'item',
          url: '/refunds',
          icon: icons.ReloadOutlined,
          perm: 'refund',
          action: 'read'
        }
      ]
    },

    // ----- Delivery & Logistics -----
    {
      id: 'logistics',
      title: 'logistics',
      type: 'collapse',
      icon: icons.CarOutlined,
      children: [
        {
          id: 'deliveries',
          title: 'deliveries',
          type: 'item',
          url: '/deliveries',
          icon: icons.CarOutlined,
          perm: 'delivery',
          action: 'read'
        },
        {
          id: 'riders',
          title: 'riders',
          type: 'item',
          url: '/riders',
          icon: icons.TeamOutlined,
          perm: 'rider',
          action: 'read'
        },
        {
          id: 'rider-locations',
          title: 'rider-locations',
          type: 'item',
          url: '/rider-locations',
          icon: icons.EnvironmentOutlined,
          perm: 'riderLocation',
          action: 'read'
        },
        {
          id: 'service-areas',
          title: 'service-areas',
          type: 'item',
          url: '/service-areas',
          icon: icons.AimOutlined,
          perm: 'serviceArea',
          action: 'read'
        }
      ]
    },

    // ----- Marketing -----
    {
      id: 'marketing',
      title: 'marketing',
      type: 'collapse',
      icon: icons.TagsOutlined,
      children: [
        {
          id: 'banners',
          title: 'banners',
          type: 'item',
          url: '/banners',
          icon: icons.PictureOutlined,
          perm: 'banner',
          action: 'read'
        },
        {
          id: 'reviews',
          title: 'reviews',
          type: 'item',
          url: '/reviews',
          icon: icons.StarOutlined,
          perm: 'review',
          action: 'read'
        }
      ]
    },

    // ----- Analytics -----
    {
      id: 'analytics',
      title: 'analytics',
      type: 'item',
      url: '/analytics',
      icon: icons.LineChartOutlined
    },

    // ----- System -----
    {
      id: 'system',
      title: 'system',
      type: 'collapse',
      icon: icons.SettingOutlined,
      children: [
        {
          id: 'users',
          title: 'users',
          type: 'item',
          url: '/users',
          icon: icons.UserOutlined,
          perm: 'user',
          action: 'read'
        },
        {
          id: 'roles',
          title: 'roles',
          type: 'item',
          url: '/roles',
          icon: icons.TeamOutlined,
          perm: 'role',
          action: 'read'
        },
        {
          id: 'permissions',
          title: 'permissions',
          type: 'item',
          url: '/permissions',
          icon: icons.LockOutlined,
          perm: 'permission',
          action: 'read'
        },
        {
          id: 'webhook-events',
          title: 'webhook-events',
          type: 'item',
          url: '/webhook-events',
          icon: icons.BellOutlined,
          perm: 'webhookEvent',
          action: 'read'
        },
        {
          id: 'audit-logs',
          title: 'audit-logs',
          type: 'item',
          url: '/audit-logs',
          icon: icons.FileSearchOutlined,
          perm: 'auditLog',
          action: 'read'
        }
      ]
    }
  ]
};

export default platformMenu;