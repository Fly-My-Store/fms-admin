import { call, put, takeLatest, all } from 'redux-saga/effects';
import { getErrorMessage } from '../../utils/errors';
import { actions } from './slice';
import * as api from '../../api/iam';

function* usersListWorker(action) {
  try {
    const resp = yield call(api.listUsers, action.payload?.params || {});
    yield put(actions.usersListSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to load');
    yield put(actions.usersListFailure(msg));
  }
}
function* usersGetWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.getUser, id);
    yield put(actions.usersGetSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to fetch');
    yield put(actions.usersGetFailure(msg));
  }
}
function* usersCreateWorker(action) {
  try {
    const resp = yield call(api.createUser, action.payload?.params);
    yield put(actions.usersCreateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Create failed');
    yield put(actions.usersCreateFailure(msg));
  }
}
function* usersUpdateWorker(action) {
  try {
    const { id, data } = action.payload?.params || {};
    const resp = yield call(api.updateUser, id, data);
    yield put(actions.usersUpdateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Update failed');
    yield put(actions.usersUpdateFailure(msg));
  }
}
function* usersRemoveWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.removeUser, id);
    yield put(actions.usersRemoveSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Delete failed');
    yield put(actions.usersRemoveFailure(msg));
  }
}

function* rolesListWorker(action) {
  try {
    const resp = yield call(api.listRoles, action.payload?.params || {});
    yield put(actions.rolesListSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to load');
    yield put(actions.rolesListFailure(msg));
  }
}
function* rolesGetWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.getRole, id);
    yield put(actions.rolesGetSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to fetch');
    yield put(actions.rolesGetFailure(msg));
  }
}
function* rolesCreateWorker(action) {
  try {
    const resp = yield call(api.createRole, action.payload?.params);
    yield put(actions.rolesCreateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Create failed');
    yield put(actions.rolesCreateFailure(msg));
  }
}
function* rolesUpdateWorker(action) {
  try {
    const { id, data } = action.payload?.params || {};
    const resp = yield call(api.updateRole, id, data);
    yield put(actions.rolesUpdateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Update failed');
    yield put(actions.rolesUpdateFailure(msg));
  }
}
function* rolesRemoveWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.removeRole, id);
    yield put(actions.rolesRemoveSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Delete failed');
    yield put(actions.rolesRemoveFailure(msg));
  }
}

function* permissionsListWorker(action) {
  try {
    const resp = yield call(api.listPermissions, action.payload?.params || {});
    yield put(actions.permissionsListSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to load');
    yield put(actions.permissionsListFailure(msg));
  }
}
function* permissionsGetWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.getPermission, id);
    yield put(actions.permissionsGetSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to fetch');
    yield put(actions.permissionsGetFailure(msg));
  }
}
function* permissionsCreateWorker(action) {
  try {
    const resp = yield call(api.createPermission, action.payload?.params);
    yield put(actions.permissionsCreateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Create failed');
    yield put(actions.permissionsCreateFailure(msg));
  }
}
function* permissionsUpdateWorker(action) {
  try {
    const { id, data } = action.payload?.params || {};
    const resp = yield call(api.updatePermission, id, data);
    yield put(actions.permissionsUpdateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Update failed');
    yield put(actions.permissionsUpdateFailure(msg));
  }
}
function* permissionsRemoveWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.removePermission, id);
    yield put(actions.permissionsRemoveSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Delete failed');
    yield put(actions.permissionsRemoveFailure(msg));
  }
}

export default function* iamSaga() {
  yield all([
    takeLatest(actions.usersListRequest.type, usersListWorker),
    takeLatest(actions.usersGetRequest.type, usersGetWorker),
    takeLatest(actions.usersCreateRequest.type, usersCreateWorker),
    takeLatest(actions.usersUpdateRequest.type, usersUpdateWorker),
    takeLatest(actions.usersRemoveRequest.type, usersRemoveWorker),
    takeLatest(actions.rolesListRequest.type, rolesListWorker),
    takeLatest(actions.rolesGetRequest.type, rolesGetWorker),
    takeLatest(actions.rolesCreateRequest.type, rolesCreateWorker),
    takeLatest(actions.rolesUpdateRequest.type, rolesUpdateWorker),
    takeLatest(actions.rolesRemoveRequest.type, rolesRemoveWorker),
    takeLatest(actions.permissionsListRequest.type, permissionsListWorker),
    takeLatest(actions.permissionsGetRequest.type, permissionsGetWorker),
    takeLatest(actions.permissionsCreateRequest.type, permissionsCreateWorker),
    takeLatest(actions.permissionsUpdateRequest.type, permissionsUpdateWorker),
    takeLatest(actions.permissionsRemoveRequest.type, permissionsRemoveWorker)
  ]);
}
