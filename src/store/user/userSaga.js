import { call, put, takeLatest, all } from 'redux-saga/effects';
import {
  fetchUserByIdRequest,
  fetchUserByIdSuccess,
  fetchUserByIdFailure
} from './userSlice';
import { getUserById } from 'api/user';

function* handleFetchUserById(action) {
  try {
    const { id, data } = action.payload || {};
    const response = yield call(getUserById, id, data);
    yield put(fetchUserByIdSuccess(response));
  } catch (error) {
    yield put(fetchUserByIdFailure(error.message || 'Failed to fetch user'));
  }
}

export default function* userSaga() {
  yield all([takeLatest(fetchUserByIdRequest.type, handleFetchUserById)]);
}
