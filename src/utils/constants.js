import {
  CameraTwoTone,
  CheckCircleTwoTone,
  CheckSquareTwoTone,
  CloseCircleTwoTone,
  InteractionTwoTone,
  PlusCircleTwoTone
} from '@ant-design/icons';

export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
  PERMISSIONS: 'auth_permissions'
};

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DEFAULT: '/dashboard',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  CONTACT_US: '/contact-us',
  FORGOT_PASSWORD: '/forget-pass',
  RESET_PASSWORD: '/reset-pass',
  VERIFY_CODE: '/verify-code',
  CHECK_MAIL: '/check-mail',
  ERROR_500: '/500',
  COMING_SOON: '/coming-soon',
  UNDER_CONSTRUCTION: '/pages/under-construction'
};

export const TABLE_STATUS = {
  ACTIVE: 1,
  INACTIVE: 2,
  SUSPENDED: 3,
  DELETED: 4
};

export const PERMISSION_NAMES = [
  'branch',
  'branchAccess',
  'business',
  'businessConfiguration',
  'city',
  'constructionActivity',
  'constructionActivityLevel',
  'constructionActivityType',
  'constructionPlan',
  'constructionPlanActivityConfig',
  'constructionPlanConfig',
  'constructionPlanEventLog',
  'constructionPlanMedia',
  'district',
  'loan',
  'loanAuthRequest',
  'loanDisbursal',
  'loanDisbursalRequest',
  'loanProperty',
  'loanPropertyStructureType',
  'loanType',
  'permission',
  'role',
  'rolePermission',
  'session',
  'state',
  'user',
  'zone'
];

export const PERMISSION_SCOPE_MAP = {
  // Platform-managed resources
  business: 'platform',
  permission: 'platform',
  role: 'platform',
  rolePermission: 'platform',
  state: 'platform',
  district: 'platform',
  constructionActivity: 'platform',
  constructionActivityLevel: 'platform',
  constructionActivityType: 'platform',
  loanType: 'platform',
  loanPropertyStructureType: 'platform',

  // Business-managed resources (loan domain + local config)
  branch: 'business',
  branchAccess: 'business',
  businessConfiguration: 'business',
  city: 'business',
  zone: 'business',
  constructionPlan: 'business',
  constructionPlanActivityConfig: 'business',
  constructionPlanConfig: 'business',
  constructionPlanEventLog: 'business',
  constructionPlanMedia: 'business',
  loan: 'business',
  loanAuthRequest: 'business',
  loanDisbursal: 'business',
  loanDisbursalRequest: 'business',
  loanProperty: 'business',

  // Shared / generic
  user: 'both',
  session: 'both'
};

export const CONSTRUCTION_PLAN_EVENT_LABELS = {
  1: 'Created',
  2: 'Submitted',
  3: 'Verified - Remote',
  4: 'Rejected',
  5: 'Verified - Site Visit',
  6: 'Reset'
};

export const CONSTRUCTION_PLAN_EVENT_ICONS = {
  1: <PlusCircleTwoTone twoToneColor="#1890ff" style={{ fontSize: 14, marginRight: '8px' }} />,
  2: <CameraTwoTone twoToneColor="#FFA500" style={{ fontSize: 14, marginRight: '8px' }} />,
  3: <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 14, marginRight: '8px' }} />,
  4: <CloseCircleTwoTone twoToneColor="#ff4d4f" style={{ fontSize: 14, marginRight: '8px' }} />,
  5: <CheckSquareTwoTone twoToneColor="#52c41a" style={{ fontSize: 14, marginRight: '8px' }} />,
  6: <InteractionTwoTone twoToneColor="#aaaaaa" style={{ fontSize: 14, marginRight: '8px' }} />
};

export const getDisbursementRequestProgressStatus = (status) => {
  switch (status) {
    case DISBURSEMENT_REQUEST_STATUS.APPROVED:
      return { label: 'Approved', color: 'success' };
    case DISBURSEMENT_REQUEST_STATUS.REJECTED:
      return { label: 'Rejected', color: 'error' };
    case DISBURSEMENT_REQUEST_STATUS.OPEN:
      return { label: 'Open', color: 'default' };
    default:
      return { label: '-', color: 'default' };
  }
};

export const DISBURSEMENT_REQUEST_EVENT_LABELS = {
  1: 'Created',
  2: 'Approved',
  3: 'Rejected'
};

export const CONSTRUCTION_PLAN_VERIFICATION_MODE = {
  REMOTE: 1,
  SITE: 2
};

export const DISBURSEMENT_REQUEST_EVENT_ICONS = {
  1: <PlusCircleTwoTone twoToneColor="#1890ff" style={{ fontSize: 14, marginRight: '8px' }} />,
  2: <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 14, marginRight: '8px' }} />,
  3: <CloseCircleTwoTone twoToneColor="#ff4d4f" style={{ fontSize: 14, marginRight: '8px' }} />
};

export const DISBURSEMENT_REQUEST_STATUS = {
  OPEN: 1,
  APPROVED: 2,
  REJECTED: 3
};

export const USER_TYPES = {
  PLATFORM: 'platform',
  BUSINESS: 'business',
  CUSTOMER: 'customer'
};

export const LOAN_STEPS = {
  LOAN: 1,
  PROPERTY: 2,
  DISBURSEMENT: 3,
  PLAN_GENERATED: 4
};

export const LOAN_STEP_TEXT_MAP = {
  1: 'Loan Generated',
  2: 'Property Added',
  3: 'Disbursement Added',
  4: 'Plan Generated'
};

// statusMessageMap.js (can be kept in a separate constants/helper file)
export const PLAN_PROGRESS_DIALOG_MAP = {
  reset: {
    title: 'Reset the status of construction Activity?',
    message:
      'Are you sure want to reset the verified activity ? This will change the status to “Yet to Start” and remove any photos and videos'
  },
  site: {
    title: 'Mark completed without photos/videos',
    message: 'Do this only if construction progress is verified by physical site visit and supporting report is available.'
  },
  verify: {
    title: 'Accept Submitted Construction Progress',
    message: 'Are you sure want to accept the submitted progress? This will verify the construction progress.'
  },
  reject: {
    title: 'Reject Submitted Construction Progress',
    message:
      'Are you sure want to reject the submitted progress? This will reject the construction progress and customer will have to submit again.'
  }
};

export const getConstructionProgressDialogContent = (status) => {
  if (status.reset) return PLAN_PROGRESS_DIALOG_MAP.reset;
  if (status.site) return PLAN_PROGRESS_DIALOG_MAP.site;
  if (status.verify) return PLAN_PROGRESS_DIALOG_MAP.verify;
  return PLAN_PROGRESS_DIALOG_MAP.reject;
};

export const getConstructionPlanProgressStatus = (progress, verificationMode) => {
  switch (progress) {
    case 1:
      return { label: 'Yet to Start', color: 'default' };
    case 2:
      return { label: 'Submitted', color: 'warning' };
    case 3:
      return {
        label: verificationMode === CONSTRUCTION_PLAN_VERIFICATION_MODE.SITE ? 'Verified - Site Visit' : 'Verified - Remote',
        color: 'success'
      };
    default:
      return { label: '-', color: 'default' };
  }
};

export const RESET_CONSTRUCTION_PLAN = {
  title: 'Reset Construction Plan Progress',
  message: 'Are you sure you want to reset the plan? It will delete all the submitted photos and reset the plan.'
};

export const DISBURSEMENT_REQUEST_STATUS_DIALOG_MAP = {
  verify: {
    title: 'Accept Disbursement Request',
    message: 'Request will be accepted and marked as approved.'
  },
  reject: {
    title: 'Reject Disbursement Request',
    message: 'Request will be rejected and marked as Rejected'
  }
};

export const getDisbursementRequestStatusDialogContent = (status) => {
  if (status === DISBURSEMENT_REQUEST_STATUS.APPROVED) return DISBURSEMENT_REQUEST_STATUS_DIALOG_MAP.verify;
  return DISBURSEMENT_REQUEST_STATUS_DIALOG_MAP.reject;
};
