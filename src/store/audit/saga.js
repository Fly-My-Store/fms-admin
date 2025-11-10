import { call, put, takeLatest, all } from 'redux-saga/effects';
import { getErrorMessage } from '../../utils/errors';
import { actions } from './slice';
import * as api from '../../api/audit';

function* auditsListWorker(action) {
  try {
    const resp = yield call(api.listAudits, action.payload?.params || {});
    yield put(actions.auditsListSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to load');
    yield put(actions.auditsListFailure(msg));
  }
}
function* auditsGetWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.getAudit, id);
    yield put(actions.auditsGetSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to fetch');
    yield put(actions.auditsGetFailure(msg));
  }
}
export default function* auditSaga() {
  yield all([takeLatest(actions.auditsListRequest.type, auditsListWorker), takeLatest(actions.auditsGetRequest.type, auditsGetWorker)]);
}
