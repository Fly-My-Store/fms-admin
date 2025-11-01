// ==============================|| ROLE & PERMISSION SAGA ||============================== //
import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchRolesRequest,
  fetchRolesSuccess,
  fetchRolesFailure,
  fetchPermissionsRequest,
  fetchPermissionsSuccess,
  fetchPermissionsFailure,
  getRoleByIdRequest,
  getRoleByIdSuccess,
  getRoleByIdFailure,
  getPermissionByIdRequest,
  getPermissionByIdSuccess,
  getPermissionByIdFailure,
  createRoleRequest,
  createRoleSuccess,
  createRoleFailure,
  updateRoleRequest,
  updateRoleSuccess,
  updateRoleFailure,
  createPermissionRequest,
  createPermissionSuccess,
  createPermissionFailure,
  updatePermissionRequest,
  updatePermissionSuccess,
  updatePermissionFailure,
  assignPermissionsRequest,
  assignPermissionsSuccess,
  assignPermissionsFailure
} from './rolePermissionSlice';

import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  getPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  assignPermissions
} from 'api/rolePermission';

function* handleFetchRoles() {
  try {
    const response = yield call(getRoles);
    yield put(fetchRolesSuccess(response));
  } catch (error) {
    yield put(fetchRolesFailure(error.message));
  }
}

function* handleGetRoleById(action) {
  try {
    const response = yield call(getRoleById, action.payload);
    yield put(getRoleByIdSuccess(response));
  } catch (error) {
    yield put(getRoleByIdFailure(error.message));
  }
}

function* handleCreateRole(action) {
  try {
    const response = yield call(createRole, action.payload);
    yield put(createRoleSuccess(response));
  } catch (error) {
    yield put(createRoleFailure(error.message));
  }
}

function* handleUpdateRole(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(updateRole, id, data);
    yield put(updateRoleSuccess(response));
  } catch (error) {
    yield put(updateRoleFailure(error.message));
  }
}

function* handleFetchPermissions(action) {
  try {
    const response = yield call(getPermissions, action.payload);
    yield put(fetchPermissionsSuccess(response));
  } catch (error) {
    yield put(fetchPermissionsFailure(error.message));
  }
}

function* handleGetPermissionById(action) {
  try {
    const response = yield call(getPermissionById, action.payload);
    yield put(getPermissionByIdSuccess(response));
  } catch (error) {
    yield put(getPermissionByIdFailure(error.message));
  }
}

function* handleCreatePermission(action) {
  try {
    const response = yield call(createPermission, action.payload);
    yield put(createPermissionSuccess(response));
  } catch (error) {
    yield put(createPermissionFailure(error.message));
  }
}

function* handleUpdatePermission(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(updatePermission, id, data);
    yield put(updatePermissionSuccess(response));
  } catch (error) {
    yield put(updatePermissionFailure(error.message));
  }
}

function* handleAssignPermissions(action) {
  try {
    yield call(assignPermissions, action.payload);
    yield put(assignPermissionsSuccess());
  } catch (error) {
    yield put(assignPermissionsFailure(error.message));
  }
}

export default function* rolePermissionSaga() {
  yield takeLatest(fetchRolesRequest.type, handleFetchRoles);
  yield takeLatest(getRoleByIdRequest.type, handleGetRoleById);
  yield takeLatest(createRoleRequest.type, handleCreateRole);
  yield takeLatest(updateRoleRequest.type, handleUpdateRole);

  yield takeLatest(fetchPermissionsRequest.type, handleFetchPermissions);
  yield takeLatest(getPermissionByIdRequest.type, handleGetPermissionById);
  yield takeLatest(createPermissionRequest.type, handleCreatePermission);
  yield takeLatest(updatePermissionRequest.type, handleUpdatePermission);

  yield takeLatest(assignPermissionsRequest.type, handleAssignPermissions);
}
