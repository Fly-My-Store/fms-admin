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

function* webhookEventsReplayWorker(action) {
  try {
    const { id, listParams } = action.payload || {};
    const resp = yield call(api.replayWebhookEvent, id);
    yield put(actions.webhookEventsReplaySuccess(resp));
    if (listParams) {
      yield put(actions.webhookEventsListRequest({ params: listParams }));
    }
  } catch (err) {
    const msg = getErrorMessage(err, 'Replay failed');
    yield put(actions.webhookEventsReplayFailure(msg));
  }
}

function* paymentOpsWorker(action) {
  const { action: op } = action.payload || {};
  try {
    const resp =
      op === 'checkout-expiry'
        ? yield call(api.runCheckoutExpiry)
        : yield call(api.runPaymentReconcile);
    yield put(actions.paymentOpsSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Operation failed');
    yield put(actions.paymentOpsFailure(msg));
  }
}

export default function* integrationsSaga() {
  yield all([
    takeLatest(actions.webhookEventsListRequest.type, webhookEventsListWorker),
    takeLatest(actions.webhookEventsGetRequest.type, webhookEventsGetWorker),
    takeLatest(actions.webhookEventsReplayRequest.type, webhookEventsReplayWorker),
    takeLatest(actions.paymentOpsRequest.type, paymentOpsWorker)
  ]);
}
