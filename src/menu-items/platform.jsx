// ==============================|| ICON IMPORTS ||============================== //
import {
  SlidersOutlined,
  BlockOutlined,
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
  BellOutlined,
  ProfileOutlined,
  LayoutOutlined,
  ControlOutlined,
  DeploymentUnitOutlined,
  BranchesOutlined,
  FilterOutlined
} from '@ant-design/icons';

// ==============================|| ICON MAPPING ||============================== //
const icons = {
  ControlOutlined,
  DeploymentUnitOutlined,
  BranchesOutlined,
  FilterOutlined,
  SlidersOutlined,
  ProfileOutlined,
  BlockOutlined,
  LayoutOutlined,
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
// Use `perm` (table/entity) + `action` ('create'|'read'|'modify'|'delete') for gating.
// All route-level ACL still enforced server-side.

const platformMenu = {
  id: 'platform-admin',
  title: '',
  type: 'group',
  children: [
    // ----- Dashboard -----
    { id: 'dashboard', title: 'dashboard', type: 'item', url: '/dashboard', icon: icons.DashboardOutlined },


    // ===== Attributes (NEW) =====
    {
      id: 'attributes',
      title: 'attributes',
      type: 'collapse',
      icon: icons.SlidersOutlined,
      children: [
        { id: 'attribute-defs', title: 'attribute-defs', type: 'item', url: '/attribute-defs', icon: icons.ProfileOutlined, perm: 'attributeDef', action: 'read' },
        { id: 'category-attributes', title: 'category-attributes', type: 'item', url: '/category-attrs', icon: icons.DeploymentUnitOutlined, perm: 'categoryAttribute', action: 'read' },
        { id: 'product-attributes', title: 'product-attributes', type: 'item', url: '/product-attrs', icon: icons.ShoppingOutlined, perm: 'categoryAttribute', action: 'read' },
        { id: 'variant-attributes', title: 'varient-attributes', type: 'item', url: '/variant-attrs', icon: icons.ShoppingOutlined, perm: 'categoryAttribute', action: 'read' },
        { id: 'attribute-groups', title: 'attribute-groups', type: 'item', url: '/attribute-groups', icon: icons.BlockOutlined, perm: 'attributeGroup', action: 'read' },
        { id: 'plp-configs', title: 'plp-configs', type: 'item', url: '/plp-configs', icon: icons.LayoutOutlined, perm: 'categoryPLPConfig', action: 'read' }
      ]
    },

    // ===== Catalog =====
    {
      id: 'catalog',
      title: 'catalog',
      type: 'collapse',
      icon: icons.ShoppingOutlined,
      breadcrumbs: true,
      children: [
        { id: 'brands', breadcrumbs: true, title: 'brands', type: 'item', url: '/brands', icon: icons.TagsOutlined, perm: 'brand', action: 'read' },
        { id: 'categories', breadcrumbs: true, title: 'categories', type: 'item', url: '/categories', icon: icons.ClusterOutlined, perm: 'category', action: 'read' },
        { id: 'products', breadcrumbs: true, title: 'products', type: 'item', url: '/products', icon: icons.AppstoreOutlined, perm: 'product', action: 'read' }
      ]
    },

    // ===== Stores =====
    {
      id: 'stores-menu',
      title: 'stores',
      type: 'collapse',
      icon: icons.ShopOutlined,
      children: [
        { id: 'sellers', title: 'sellers', type: 'item', url: '/sellers', icon: icons.TeamOutlined, perm: 'seller', action: 'read' },
        { id: 'stores', title: 'stores', type: 'item', url: '/stores', icon: icons.ShopOutlined, perm: 'store', action: 'read' },
        { id: 'service-areas', title: 'service-areas', type: 'item', url: '/service-areas', icon: icons.AimOutlined, perm: 'serviceArea', action: 'read' }
      ]
    },

    // ===== Listings & Inventory (NEW GROUP) =====
    {
      id: 'listings-inventory',
      title: 'listings-inventory',
      type: 'collapse',
      icon: icons.DatabaseOutlined,
      children: [
        { id: 'store-variants', title: 'store-variants', type: 'item', url: '/store-variants', icon: icons.SyncOutlined, perm: 'storeVariant', action: 'read' },
        { id: 'inventory-movements', title: 'inventory-movements', type: 'item', url: '/inventory-movements', icon: icons.FileSearchOutlined, perm: 'inventoryMovement', action: 'read' }
      ]
    },

    // ===== Orders & Customers =====
    {
      id: 'orders',
      title: 'orders-customers',
      type: 'collapse',
      icon: icons.ShoppingCartOutlined,
      children: [
        { id: 'orders-list', title: 'orders', type: 'item', url: '/orders', icon: icons.ShoppingCartOutlined, perm: 'order', action: 'read' },
        { id: 'order-events', title: 'order-events', type: 'item', url: '/order-events', icon: icons.ReloadOutlined, perm: 'orderEvent', action: 'read' },
        { id: 'carts', title: 'carts', type: 'item', url: '/carts', icon: icons.ShoppingCartOutlined, perm: 'cart', action: 'read' },
        { id: 'customers', title: 'customers', type: 'item', url: '/customers', icon: icons.UserOutlined, perm: 'user', action: 'read' }
      ]
    },

    // ===== Payments =====
    {
      id: 'payments',
      title: 'payments',
      type: 'collapse',
      icon: icons.CreditCardOutlined,
      children: [
        { id: 'payments-list', title: 'payments', type: 'item', url: '/payments', icon: icons.CreditCardOutlined, perm: 'payment', action: 'read' },
        { id: 'refunds', title: 'refunds', type: 'item', url: '/refunds', icon: icons.ReloadOutlined, perm: 'refund', action: 'read' },
        { id: 'fare', title: 'fare-pricing', type: 'item', url: '/fare', icon: icons.SettingOutlined, perm: 'payment', action: 'modify' },
        { id: 'payouts', title: 'payouts', type: 'item', url: '/payouts', icon: icons.LineChartOutlined, perm: 'payment', action: 'modify' }
      ]
    },

    // ===== Logistics =====
    {
      id: 'logistics',
      title: 'logistics',
      type: 'collapse',
      icon: icons.CarOutlined,
      children: [
        { id: 'deliveries', title: 'deliveries', type: 'item', url: '/deliveries', icon: icons.CarOutlined, perm: 'delivery', action: 'read' },
        { id: 'delivery-jobs', title: 'delivery-jobs', type: 'item', url: '/delivery-jobs', icon: icons.SyncOutlined, perm: 'deliveryJob', action: 'read' }, // NEW
        { id: 'riders', title: 'riders', type: 'item', url: '/riders', icon: icons.TeamOutlined, perm: 'rider', action: 'read' }
      ]
    },

    // ===== Marketing & Content =====
    {
      id: 'marketing',
      title: 'marketing',
      type: 'collapse',
      icon: icons.TagsOutlined,
      children: [
        { id: 'banners', title: 'banners', type: 'item', url: '/banners', icon: icons.PictureOutlined, perm: 'banner', action: 'read' },
      ]
    },

    // ===== Geo & Addressing (NEW GROUP) =====
    {
      id: 'geo',
      title: 'geo',
      type: 'collapse',
      icon: icons.EnvironmentOutlined,
      children: [
        { id: 'pincodes', title: 'pincodes', type: 'item', url: '/pincodes', icon: icons.EnvironmentOutlined, perm: 'geoPincode', action: 'read' },
        { id: 'addresses', title: 'addresses', type: 'item', url: '/addresses', icon: icons.EnvironmentOutlined, perm: 'address', action: 'read' }
      ]
    },

    // ===== System =====
    {
      id: 'system',
      title: 'system',
      type: 'collapse',
      icon: icons.SettingOutlined,
      children: [
        { id: 'users', title: 'users', type: 'item', url: '/users', icon: icons.UserOutlined, perm: 'user', action: 'read' },
        { id: 'roles', title: 'roles', type: 'item', url: '/roles', icon: icons.TeamOutlined, perm: 'role', action: 'read' },
        { id: 'permissions', title: 'permissions', type: 'item', url: '/permissions', icon: icons.LockOutlined, perm: 'permission', action: 'read' },
        { id: 'webhook-events', title: 'webhook-events', type: 'item', url: '/webhook-events', icon: icons.BellOutlined, perm: 'webhookEvent', action: 'read' },
        { id: 'audit-logs', title: 'audit-logs', type: 'item', url: '/audit-logs', icon: icons.FileSearchOutlined, perm: 'auditLog', action: 'read' }
      ]
    }
  ]
};

export default platformMenu;
