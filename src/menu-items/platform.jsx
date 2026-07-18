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
  ShopOutlined,
  TeamOutlined,
  UserOutlined,
  LockOutlined,
  SettingOutlined,
  ClusterOutlined,
  LineChartOutlined,
  CreditCardOutlined,
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
  MobileOutlined,
  FileTextOutlined
} from '@ant-design/icons';

// ==============================|| ICON MAPPING ||============================== //
const icons = {
  ControlOutlined,
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
  ShopOutlined,
  TeamOutlined,
  UserOutlined,
  LockOutlined,
  SettingOutlined,
  ClusterOutlined,
  LineChartOutlined,
  CreditCardOutlined,
  EnvironmentOutlined,
  CarOutlined,
  AimOutlined,
  FileSearchOutlined,
  ReloadOutlined,
  BellOutlined,
  DeploymentUnitOutlined,
  MobileOutlined,
  FileTextOutlined
};

// ==============================|| MENU ITEMS - FLY MY STORE (PLATFORM) ||============================== //
// Use `perm` (table/entity) + `action` ('create'|'read'|'modify'|'delete') for gating.
// All route-level ACL still enforced server-side.
// Each section is a `group` with a title; children are flat `item` links (no collapse).

const platformMenuGroups = [
  {
    id: 'main',
    type: 'group',
    title: '',
    children: [{ id: 'dashboard', title: 'dashboard', type: 'item', url: '/dashboard', icon: icons.DashboardOutlined }]
  },
  {
    id: 'operations',
    type: 'group',
    title: 'operations',
    children: [
      { id: 'orders-list', title: 'orders', type: 'item', url: '/orders', icon: icons.ShoppingCartOutlined, perm: 'order', action: 'read' },
      { id: 'deliveries', title: 'deliveries', type: 'item', url: '/deliveries', icon: icons.CarOutlined, perm: 'deliveryJob', action: 'read' },
      { id: 'riders', title: 'riders', type: 'item', url: '/riders', icon: icons.TeamOutlined, perm: 'rider', action: 'read' },
      { id: 'support-tickets', title: 'support-tickets', type: 'item', url: '/support-tickets', icon: icons.BellOutlined },
      { id: 'carts', title: 'carts', type: 'item', url: '/carts', icon: icons.ShoppingCartOutlined, perm: 'cart', action: 'read' }
    ]
  },
  {
    id: 'marketplace',
    type: 'group',
    title: 'marketplace',
    children: [
      { id: 'stores', title: 'stores', type: 'item', url: '/stores', icon: icons.ShopOutlined, perm: 'store', action: 'read' },
      { id: 'sellers', title: 'sellers', type: 'item', url: '/sellers', icon: icons.TeamOutlined, perm: 'seller', action: 'read' },
      {
        id: 'service-areas',
        title: 'service-areas',
        type: 'item',
        url: '/service-areas',
        icon: icons.AimOutlined,
        perm: 'serviceArea',
        action: 'read',
        legacy: true
      },
      { id: 'customers', title: 'customers', type: 'item', url: '/customers', icon: icons.UserOutlined, perm: 'user', action: 'read' }
    ]
  },
  {
    id: 'catalog',
    type: 'group',
    title: 'catalog',
    children: [
      { id: 'brands', breadcrumbs: true, title: 'brands', type: 'item', url: '/brands', icon: icons.TagsOutlined, perm: 'brand', action: 'read' },
      {
        id: 'categories',
        breadcrumbs: true,
        title: 'categories',
        type: 'item',
        url: '/categories',
        icon: icons.ClusterOutlined,
        perm: 'category',
        action: 'read'
      },
      { id: 'products', breadcrumbs: true, title: 'products', type: 'item', url: '/products', icon: icons.AppstoreOutlined, perm: 'product', action: 'read' }
    ]
  },
  {
    id: 'catalog-setup',
    type: 'group',
    title: 'catalog-setup',
    children: [
      {
        id: 'admin-data-guide',
        title: 'admin-data-guide',
        type: 'item',
        url: '/admin-data-guide',
        icon: icons.FileTextOutlined
      },
      {
        id: 'attribute-defs',
        title: 'attribute-defs',
        type: 'item',
        url: '/attribute-defs',
        icon: icons.ProfileOutlined,
        perm: 'attributeDef',
        action: 'read'
      },
      {
        id: 'category-attributes',
        title: 'category-attributes',
        type: 'item',
        url: '/category-attrs',
        icon: icons.DeploymentUnitOutlined,
        perm: 'categoryAttribute',
        action: 'read'
      },
      {
        id: 'attribute-groups',
        title: 'attribute-groups',
        type: 'item',
        url: '/attribute-groups',
        icon: icons.BlockOutlined,
        perm: 'attributeGroup',
        action: 'read',
        legacy: true
      },
      {
        id: 'plp-configs',
        title: 'plp-configs',
        type: 'item',
        url: '/plp-configs',
        icon: icons.LayoutOutlined,
        perm: 'categoryPLPConfig',
        action: 'read',
        legacy: true
      }
    ]
  },
  {
    id: 'finance',
    type: 'group',
    title: 'finance',
    children: [
      { id: 'payments-list', title: 'payments', type: 'item', url: '/payments', icon: icons.CreditCardOutlined, perm: 'payment', action: 'read' },
      { id: 'refunds', title: 'refunds', type: 'item', url: '/refunds', icon: icons.ReloadOutlined, perm: 'refund', action: 'read' },
      { id: 'payouts', title: 'payouts', type: 'item', url: '/payouts', icon: icons.LineChartOutlined, perm: 'payment', action: 'modify' }
    ]
  },
  {
    id: 'content-geo',
    type: 'group',
    title: 'content-geo',
    children: [
      { id: 'banners', title: 'banners', type: 'item', url: '/banners', icon: icons.PictureOutlined, perm: 'banner', action: 'read' },
      { id: 'faqs', title: 'faqs', type: 'item', url: '/faqs', icon: icons.ProfileOutlined },
      {
        id: 'pincodes',
        title: 'pincodes',
        type: 'item',
        url: '/pincodes',
        icon: icons.EnvironmentOutlined,
        perm: 'geoPincode',
        action: 'read',
        legacy: true
      },
      {
        id: 'addresses',
        title: 'addresses',
        type: 'item',
        url: '/addresses',
        icon: icons.EnvironmentOutlined,
        perm: 'address',
        action: 'read',
        legacy: true
      }
    ]
  },
  {
    id: 'platform-config',
    type: 'group',
    title: 'platform-config',
    children: [
      { id: 'fare', title: 'fare-pricing', type: 'item', url: '/fare', icon: icons.SettingOutlined, perm: 'payment', action: 'modify' },
      {
        id: 'invoice-settings',
        title: 'invoice-settings',
        type: 'item',
        url: '/invoice-settings',
        icon: icons.ProfileOutlined,
        perm: 'payment',
        action: 'modify'
      },
      { id: 'webhook-events', title: 'webhook-events', type: 'item', url: '/webhook-events', icon: icons.BellOutlined, perm: 'webhookEvent', action: 'read' }
    ]
  },
  {
    id: 'app-releases',
    type: 'group',
    title: 'app-releases',
    children: [
      {
        id: 'app-releases-overview',
        title: 'app-releases-overview',
        type: 'item',
        url: '/downloads',
        target: true,
        icon: icons.MobileOutlined,
        perm: 'appRelease',
        action: 'read'
      },
      {
        id: 'app-releases-customer',
        title: 'customer-apk',
        type: 'item',
        url: '/app-releases/customer',
        icon: icons.MobileOutlined,
        perm: 'appRelease',
        action: 'read'
      },
      {
        id: 'app-releases-seller',
        title: 'seller-apk',
        type: 'item',
        url: '/app-releases/seller',
        icon: icons.MobileOutlined,
        perm: 'appRelease',
        action: 'read'
      },
      {
        id: 'app-releases-rider',
        title: 'rider-apk',
        type: 'item',
        url: '/app-releases/rider',
        icon: icons.MobileOutlined,
        perm: 'appRelease',
        action: 'read'
      }
    ]
  },
  {
    id: 'system',
    type: 'group',
    title: 'system',
    children: [
      { id: 'users', title: 'users', type: 'item', url: '/users', icon: icons.UserOutlined, perm: 'user', action: 'read' },
      { id: 'roles', title: 'roles', type: 'item', url: '/roles', icon: icons.TeamOutlined, perm: 'role', action: 'read' },
      { id: 'permissions', title: 'permissions', type: 'item', url: '/permissions', icon: icons.LockOutlined, perm: 'permission', action: 'read' },
      {
        id: 'audit-logs',
        title: 'audit-logs',
        type: 'item',
        url: '/audit-logs',
        icon: icons.FileSearchOutlined,
        perm: 'auditLog',
        action: 'read',
        legacy: true
      }
    ]
  }
];

export default platformMenuGroups;
