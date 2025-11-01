import { all } from 'redux-saga/effects';
import authSaga from './auth/authSaga';
import userSaga from './user/userSaga';
import rolePermissionSaga from './rolePermission/rolePermissionSaga';
import businessSaga from './business/businessSaga';
import constructionActivitySaga from './constructionActivity/constructionActivitySaga';
import loanSaga from './loan/loanSaga';
import branchSaga from './branch/branchSaga';
import branchAccessSaga from './branchAccess/branchAccessSaga';
import constructionPlanConfigSaga from './constructionPlanConfig/constructionPlanConfigSaga';
import constructionPlanActivityConfigSaga from './constructionPlanActivityConfig/constructionPlanActivityConfigSaga';
import locationSaga from './location/locationSaga';
import dashboardSaga from './dashboard/dashboardSaga';

export default function* rootSaga() {
  yield all([
    authSaga(),
    userSaga(),
    rolePermissionSaga(),
    businessSaga(),
    constructionActivitySaga(),
    loanSaga(),
    branchSaga(),
    branchAccessSaga(),
    constructionPlanConfigSaga(),
    constructionPlanActivityConfigSaga(),
    locationSaga(),
    dashboardSaga()
  ]);
}
