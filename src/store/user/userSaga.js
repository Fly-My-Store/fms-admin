import { call, put, takeLatest, all } from 'redux-saga/effects';
import {
  fetchUsersRequest,
  fetchUsersSuccess,
  fetchUsersFailure,
  fetchBusinessUsersRequest,
  fetchBusinessUsersSuccess,
  fetchBusinessUsersFailure,
  fetchUserByIdRequest,
  fetchUserByIdSuccess,
  fetchUserByIdFailure,
  createUserRequest,
  createUserSuccess,
  createUserFailure,
  updateUserRequest,
  updateUserSuccess,
  updateUserFailure,
  createBusinessUserRequest,
  createBusinessUserSuccess,
  createBusinessUserFailure,
  updateBusinessUserRequest,
  updateBusinessUserSuccess,
  updateBusinessUserFailure
} from './userSlice';
import { getUsers, getBusinessUsers, getUserById, createUser, updateUser, updateBusinessUser, createBusinessUser } from 'api/user';

function* handleFetchUsers(action) {
  try {
    const response = yield call(getUsers, action.payload);
    console.log('Payload in response:', response);

    yield put(fetchUsersSuccess(response));
  } catch (error) {
    yield put(fetchUsersFailure(error.message || 'Failed to fetch users'));
  }
}

function* handleFetchBusinessUsers(action) {
  try {
    const response = yield call(getBusinessUsers, action.payload);
    yield put(fetchBusinessUsersSuccess(response));
  } catch (error) {
    yield put(fetchBusinessUsersFailure(error.message || 'Failed to fetch users'));
  }
}

function* handleFetchUserById(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(getUserById, id, data); // user id
    yield put(fetchUserByIdSuccess(response));
  } catch (error) {
    yield put(fetchUserByIdFailure(error.message || 'Failed to fetch user'));
  }
}

function* handleCreateUser(action) {
  try {
    const response = yield call(createUser, action.payload);
    yield put(createUserSuccess(response));
  } catch (error) {
    yield put(createUserFailure(error.message || 'Failed to create user'));
  }
}

function* handleUpdateUser(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(updateUser, id, data);
    yield put(updateUserSuccess(response));
  } catch (error) {
    yield put(updateUserFailure(error.message || 'Failed to update user'));
  }
}

function* handleCreateBusinessUser(action) {
  try {
    const response = yield call(createBusinessUser, action.payload);
    yield put(createBusinessUserSuccess(response));
  } catch (error) {
    yield put(createBusinessUserFailure(error.message));
  }
}

function* handleUpdateBusinessUser(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(updateBusinessUser, id, data);
    yield put(updateBusinessUserSuccess(response));
  } catch (error) {
    yield put(updateBusinessUserFailure(error.message));
  }
}

export default function* userSaga() {
  yield all([
    takeLatest(fetchUsersRequest.type, handleFetchUsers),
    takeLatest(fetchBusinessUsersRequest.type, handleFetchBusinessUsers),
    takeLatest(fetchUserByIdRequest.type, handleFetchUserById),
    takeLatest(createUserRequest.type, handleCreateUser),
    takeLatest(updateUserRequest.type, handleUpdateUser),
    takeLatest(createBusinessUserRequest.type, handleCreateBusinessUser),
    takeLatest(updateBusinessUserRequest.type, handleUpdateBusinessUser)
  ]);
}
