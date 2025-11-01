// branchAccessSaga.js
import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchBranchAccessesRequest,
  fetchBranchAccessesSuccess,
  fetchBranchAccessesFailure,
  fetchBranchAccessByIdRequest,
  fetchBranchAccessByIdSuccess,
  fetchBranchAccessByIdFailure,
  createBranchAccessRequest,
  createBranchAccessSuccess,
  createBranchAccessFailure,
  updateBranchAccessRequest,
  updateBranchAccessSuccess,
  updateBranchAccessFailure
} from './branchAccessSlice';
import { getBranchAccesses, getBranchAccessById, createBranchAccess, updateBranchAccess } from 'api/merchant';

function* handleFetchBranchAccesses(action) {
  try {
    const response = yield call(getBranchAccesses, action.payload);
    yield put(fetchBranchAccessesSuccess(response));
  } catch (error) {
    yield put(fetchBranchAccessesFailure(error.message || 'Failed to fetch branchAccesses'));
  }
}

function* handleFetchBranchAccessById(action) {
  try {
    const response = yield call(getBranchAccessById, action.payload);
    yield put(fetchBranchAccessByIdSuccess(response));
  } catch (error) {
    yield put(fetchBranchAccessByIdFailure(error.message || 'Failed to fetch branchAccess'));
  }
}

function* handleCreateBranchAccess(action) {
  try {
    const response = yield call(createBranchAccess, action.payload);
    yield put(createBranchAccessSuccess(response));
  } catch (error) {
    yield put(createBranchAccessFailure(error.message || 'Failed to create branchAccess'));
  }
}

function* handleUpdateBranchAccess(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(updateBranchAccess, id, data);
    yield put(updateBranchAccessSuccess(response));
  } catch (error) {
    yield put(updateBranchAccessFailure(error.message || 'Failed to update branchAccess'));
  }
}

export default function* branchAccessSaga() {
  yield takeLatest(fetchBranchAccessesRequest.type, handleFetchBranchAccesses);
  yield takeLatest(fetchBranchAccessByIdRequest.type, handleFetchBranchAccessById);
  yield takeLatest(createBranchAccessRequest.type, handleCreateBranchAccess);
  yield takeLatest(updateBranchAccessRequest.type, handleUpdateBranchAccess);
}
