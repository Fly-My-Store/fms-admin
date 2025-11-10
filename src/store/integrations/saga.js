import { call, put, takeLatest, all } from 'redux-saga/effects';
import { getErrorMessage } from '../../utils/errors';
import { actions } from './slice';
import * as api from '../../api/integrations';

function* webhookEventsListWorker(action) {
  try {
    const resp = yield call(api.listWebhookEvents, action.payload?.params || {});
    yield put(actions.webhookEventsListSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to load');
    yield put(actions.webhookEventsListFailure(msg));
  }
}
function* webhookEventsGetWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.getWebhookEvent, id);
    yield put(actions.webhookEventsGetSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to fetch');
    yield put(actions.webhookEventsGetFailure(msg));
  }
}

export default function* integrationsSaga() {
  yield all([
    takeLatest(actions.webhookEventsListRequest.type, webhookEventsListWorker),
    takeLatest(actions.webhookEventsGetRequest.type, webhookEventsGetWorker)
  ]);
}
