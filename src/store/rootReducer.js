import { combineReducers } from '@reduxjs/toolkit';

import authReducer from './auth/authSlice';
import userReducer from './user/userSlice';
import rolePermissionReducer from './rolePermission/rolePermissionSlice';
import businessReducer from './business/businessSlice';
import constructionActivityReducer from './constructionActivity/constructionActivitySlice';
import loanReducer from './loan/loanSlice';
import branchReducer from './branch/branchSlice';
import branchAccessReducer from './branchAccess/branchAccessSlice';
import constructionPlanConfigReducer from './constructionPlanConfig/constructionPlanConfigSlice';
import constructionPlanActivityConfigReducer from './constructionPlanActivityConfig/constructionPlanActivityConfigSlice';
import locationReducer from './location/locationSlice';
import dashboardReducer from './dashboard/dashboardSlice';

const appReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  rolePermission: rolePermissionReducer,
  business: businessReducer,
  constructionActivity: constructionActivityReducer,
  loan: loanReducer,
  branch: branchReducer,
  branchAccess: branchAccessReducer,
  constructionPlanConfig: constructionPlanConfigReducer,
  constructionPlanActivityConfig: constructionPlanActivityConfigReducer,
  location: locationReducer,
  dashboard: dashboardReducer
});

export const rootReducer = (state, action) => {
  if (action.type === 'auth/logout') {
    state = undefined;
  }
  return appReducer(state, action);
};
