// ==============================|| ICON IMPORTS ||============================== //
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  SendOutlined,
  CarOutlined,
  CustomerServiceOutlined,
  ShopOutlined,
  IdcardOutlined,
  UserOutlined,
  AppstoreOutlined,
  UngroupOutlined,
  TrademarkCircleOutlined,
  ApartmentOutlined,
  CloudUploadOutlined,
  AuditOutlined,
  ControlOutlined,
  NodeIndexOutlined,
  PictureOutlined,
  NotificationOutlined,
  GiftOutlined,
  QuestionCircleOutlined,
  CreditCardOutlined,
  RollbackOutlined,
  WalletOutlined,
  CalculatorOutlined,
  FileTextOutlined,
  MobileOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  LockOutlined,
  ApiOutlined,
  ShareAltOutlined,
  FileSearchOutlined
} from '@ant-design/icons';

const icons = {
  DashboardOutlined,
  ShoppingCartOutlined,
  SendOutlined,
  CarOutlined,
  CustomerServiceOutlined,
  ShopOutlined,
  IdcardOutlined,
  UserOutlined,
  AppstoreOutlined,
  UngroupOutlined,
  TrademarkCircleOutlined,
  ApartmentOutlined,
  CloudUploadOutlined,
  AuditOutlined,
  ControlOutlined,
  NodeIndexOutlined,
  PictureOutlined,
  NotificationOutlined,
  GiftOutlined,
  QuestionCircleOutlined,
  CreditCardOutlined,
  RollbackOutlined,
  WalletOutlined,
  CalculatorOutlined,
  FileTextOutlined,
  MobileOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  LockOutlined,
  ApiOutlined,
  FileSearchOutlined,
  ShareAltOutlined
};

// Use `perm` + `action` for gating. `anyOf` shows the item if any listed grant matches.
// Hidden routes (carts, service-areas, addresses, etc.) stay reachable by URL.

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
      { id: 'deliveries', title: 'deliveries', type: 'item', url: '/deliveries', icon: icons.SendOutlined, perm: 'deliveryJob', action: 'read' },
      { id: 'riders', title: 'riders', type: 'item', url: '/riders', icon: icons.CarOutlined, perm: 'rider', action: 'read' },
      { id: 'support-tickets', title: 'support-tickets', type: 'item', url: '/support-tickets', icon: icons.CustomerServiceOutlined, perm: 'supportTicket', action: 'read' }
    ]
  },
  {
    id: 'network',
    type: 'group',
    title: 'network',
    children: [
      { id: 'stores', title: 'stores', type: 'item', url: '/stores', icon: icons.ShopOutlined, perm: 'store', action: 'read' },
      { id: 'sellers', title: 'sellers', type: 'item', url: '/sellers', icon: icons.IdcardOutlined, perm: 'seller', action: 'read' },
      { id: 'customers', title: 'customers', type: 'item', url: '/customers', icon: icons.UserOutlined, perm: 'user', action: 'read' }
    ]
  },
  {
    id: 'catalog',
    type: 'group',
    title: 'catalog',
    children: [
      { id: 'products', breadcrumbs: true, title: 'products', type: 'item', url: '/products', icon: icons.AppstoreOutlined, perm: 'product', action: 'read' },
      {
        id: 'product-variants',
        breadcrumbs: true,
        title: 'product-variants',
        type: 'item',
        url: '/product-variants',
        icon: icons.UngroupOutlined,
        perm: 'product',
        action: 'read'
      },
      { id: 'brands', breadcrumbs: true, title: 'brands', type: 'item', url: '/brands', icon: icons.TrademarkCircleOutlined, perm: 'brand', action: 'read' },
      {
        id: 'categories',
        breadcrumbs: true,
        title: 'categories',
        type: 'item',
        url: '/categories',
        icon: icons.ApartmentOutlined,
        perm: 'category',
        action: 'read'
      },
      {
        id: 'catalog-bulk-import',
        title: 'catalog-bulk-import',
        type: 'item',
        url: '/catalog-bulk-import',
        icon: icons.CloudUploadOutlined,
        perm: 'product',
        action: 'create'
      },
      {
        id: 'catalog-pending',
        title: 'catalog-pending',
        type: 'item',
        url: '/catalog-pending',
        icon: icons.AuditOutlined,
        anyOf: [
          { perm: 'brand', action: 'modify' },
          { perm: 'category', action: 'modify' },
          { perm: 'product', action: 'modify' }
        ]
      },
      {
        id: 'attribute-defs',
        title: 'attribute-defs',
        type: 'item',
        url: '/attribute-defs',
        icon: icons.ControlOutlined,
        perm: 'attributeDef',
        action: 'read'
      },
      {
        id: 'category-attributes',
        title: 'category-attributes',
        type: 'item',
        url: '/category-attrs',
        icon: icons.NodeIndexOutlined,
        perm: 'categoryAttribute',
        action: 'read'
      }
    ]
  },
  {
    id: 'marketing',
    type: 'group',
    title: 'marketing',
    children: [
      { id: 'banners', title: 'banners', type: 'item', url: '/banners', icon: icons.PictureOutlined, perm: 'banner', action: 'read' },
      { id: 'share-links', title: 'share-links', type: 'item', url: '/share-links', icon: icons.ShareAltOutlined, perm: 'shareLink', action: 'read' },
      { id: 'promotion-campaigns', title: 'campaigns', type: 'item', url: '/promotion-campaigns', icon: icons.NotificationOutlined, perm: 'promotion', action: 'read' },
      { id: 'promotions', title: 'promotions', type: 'item', url: '/promotions', icon: icons.GiftOutlined, perm: 'promotion', action: 'read' },
      { id: 'faqs', title: 'faqs', type: 'item', url: '/faqs', icon: icons.QuestionCircleOutlined, perm: 'faq', action: 'read' }
    ]
  },
  {
    id: 'finance',
    type: 'group',
    title: 'finance',
    children: [
      { id: 'payments-list', title: 'payments', type: 'item', url: '/payments', icon: icons.CreditCardOutlined, perm: 'payment', action: 'read' },
      { id: 'refunds', title: 'refunds', type: 'item', url: '/refunds', icon: icons.RollbackOutlined, perm: 'refund', action: 'read' },
      { id: 'payouts', title: 'payouts', type: 'item', url: '/payouts', icon: icons.WalletOutlined, perm: 'payment', action: 'modify' },
      { id: 'fare', title: 'fare-pricing', type: 'item', url: '/fare', icon: icons.CalculatorOutlined, perm: 'payment', action: 'modify' },
      {
        id: 'invoice-settings',
        title: 'invoice-settings',
        type: 'item',
        url: '/invoice-settings',
        icon: icons.FileTextOutlined,
        perm: 'payment',
        action: 'modify'
      }
    ]
  },
  {
    id: 'apps',
    type: 'group',
    title: 'apps',
    children: [
      {
        id: 'app-releases-overview',
        title: 'app-releases',
        type: 'item',
        url: '/app-releases',
        icon: icons.MobileOutlined
      }
    ]
  },
  {
    id: 'administration',
    type: 'group',
    title: 'administration',
    children: [
      { id: 'users', title: 'users', type: 'item', url: '/users', icon: icons.TeamOutlined, perm: 'user', action: 'read' },
      { id: 'roles', title: 'roles', type: 'item', url: '/roles', icon: icons.SafetyCertificateOutlined, perm: 'role', action: 'read' },
      { id: 'permissions', title: 'permissions', type: 'item', url: '/permissions', icon: icons.LockOutlined, perm: 'permission', action: 'read' },
      { id: 'webhook-events', title: 'webhook-events', type: 'item', url: '/webhook-events', icon: icons.ApiOutlined, perm: 'webhookEvent', action: 'read' },
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
