// branchSaga.js
import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchBranchesRequest,
  fetchBranchesSuccess,
  fetchBranchesFailure,
  fetchBranchByIdRequest,
  fetchBranchByIdSuccess,
  fetchBranchByIdFailure,
  createBranchRequest,
  createBranchSuccess,
  createBranchFailure,
  updateBranchRequest,
  updateBranchSuccess,
  updateBranchFailure
} from './branchSlice';
import { getBranches, getBranchById, createBranch, updateBranch } from 'api/brand';

function* handleFetchBranches(action) {
  try {
    const response = yield call(getBranches, action.payload);
    yield put(fetchBranchesSuccess(response));
  } catch (error) {
    yield put(fetchBranchesFailure(error.message || 'Failed to fetch branches'));
  }
}

function* handleFetchBranchById(action) {
  try {
    const response = yield call(getBranchById, action.payload);
    yield put(fetchBranchByIdSuccess(response));
  } catch (error) {
    yield put(fetchBranchByIdFailure(error.message || 'Failed to fetch branch'));
  }
}

function* handleCreateBranch(action) {
  try {
    const response = yield call(createBranch, action.payload);
    yield put(createBranchSuccess(response));
  } catch (error) {
    yield put(createBranchFailure(error.message || 'Failed to create branch'));
  }
}

function* handleUpdateBranch(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(updateBranch, id, data);
    yield put(updateBranchSuccess(response));
  } catch (error) {
    yield put(updateBranchFailure(error.message || 'Failed to update branch'));
  }
}

export default function* branchSaga() {
  yield takeLatest(fetchBranchesRequest.type, handleFetchBranches);
  yield takeLatest(fetchBranchByIdRequest.type, handleFetchBranchById);
  yield takeLatest(createBranchRequest.type, handleCreateBranch);
  yield takeLatest(updateBranchRequest.type, handleUpdateBranch);
}
