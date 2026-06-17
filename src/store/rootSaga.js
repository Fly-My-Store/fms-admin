import { all } from 'redux-saga/effects';
import authSaga from './auth/authSaga';
import userSaga from './user/userSaga';
import iam from './iam/saga';
import catalog from './catalog/saga';
import attributes from './attributes/saga';
import sellersStores from './sellersStores/saga';
import ordersPayments from './ordersPayments/saga';
import logistics from './logistics/saga';
import content from './content/saga';
import geo from './geo/saga';
import integrations from './integrations/saga';
import audit from './audit/saga';

export default function* rootSaga() {
  yield all([]);
  yield all([
    authSaga(),
    userSaga(),
    iam(),
    catalog(),
    attributes(),
    sellersStores(),
    ordersPayments(),
    logistics(),
    content(),
    geo(),
    integrations(),
    audit()
  ]);
}
