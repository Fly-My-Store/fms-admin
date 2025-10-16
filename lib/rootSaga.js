import { all, fork } from 'redux-saga/effects';
import authSaga from './sagas/authSaga';
import usersSaga from './sagas/usersSaga';
import vendorsSaga from './sagas/vendorsSaga';
import ordersSaga from './sagas/ordersSaga';
import payoutsSaga from './sagas/payoutsSaga';
import uiSaga from './sagas/uiSaga';

export default function* rootSaga() {
  yield all([fork(authSaga), fork(usersSaga), fork(vendorsSaga), fork(ordersSaga), fork(payoutsSaga), fork(uiSaga)]);
}
