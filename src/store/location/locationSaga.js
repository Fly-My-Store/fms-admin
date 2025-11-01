import { call, put, takeLatest, all } from 'redux-saga/effects';
import {
  // Branch
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
  updateBranchFailure,

  // State
  fetchStatesRequest,
  fetchStatesSuccess,
  fetchStatesFailure,
  fetchStateByIdRequest,
  fetchStateByIdSuccess,
  fetchStateByIdFailure,
  createStateRequest,
  createStateSuccess,
  createStateFailure,
  updateStateRequest,
  updateStateSuccess,
  updateStateFailure,

  // District
  fetchDistrictsRequest,
  fetchDistrictsSuccess,
  fetchDistrictsFailure,
  fetchDistrictByIdRequest,
  fetchDistrictByIdSuccess,
  fetchDistrictByIdFailure,
  createDistrictRequest,
  createDistrictSuccess,
  createDistrictFailure,
  updateDistrictRequest,
  updateDistrictSuccess,
  updateDistrictFailure,

  // City
  fetchCitiesRequest,
  fetchCitiesSuccess,
  fetchCitiesFailure,
  fetchCityByIdRequest,
  fetchCityByIdSuccess,
  fetchCityByIdFailure,
  createCityRequest,
  createCitySuccess,
  createCityFailure,
  updateCityRequest,
  updateCitySuccess,
  updateCityFailure,

  // Zone
  fetchZonesRequest,
  fetchZonesSuccess,
  fetchZonesFailure,
  fetchZoneByIdRequest,
  fetchZoneByIdSuccess,
  fetchZoneByIdFailure,
  createZoneRequest,
  createZoneSuccess,
  createZoneFailure,
  updateZoneRequest,
  updateZoneSuccess,
  updateZoneFailure,

  // Branch Summary
  fetchBranchSummaryRequest,
  fetchBranchSummarySuccess,
  fetchBranchSummaryFailure,
  fetchGeoMapPropertiesRequest,
  fetchGeoMapPropertiesSuccess,
  fetchGeoMapPropertiesFailure,
  fetchGeoMapBranchesRequest,
  fetchGeoMapBranchesSuccess,
  fetchGeoMapBranchesFailure
} from './locationSlice';

import {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  getStates,
  getStateById,
  createState,
  updateState,
  getDistricts,
  getDistrictById,
  createDistrict,
  updateDistrict,
  getCities,
  getCityById,
  createCity,
  updateCity,
  getZones,
  getZoneById,
  createZone,
  updateZone,
  getBranchSummary,
  getGeoMapProperties,
  getGeoMapBranches
} from 'api/location';

// ===== BRANCH =====
function* handleFetchBranches(action) {
  try {
    const res = yield call(getBranches, action.payload);
    yield put(fetchBranchesSuccess(res.data));
  } catch (err) {
    yield put(fetchBranchesFailure(err.message));
  }
}
function* handleFetchBranchById(action) {
  try {
    const res = yield call(getBranchById, action.payload);
    yield put(fetchBranchByIdSuccess(res.data));
  } catch (err) {
    yield put(fetchBranchByIdFailure(err.message));
  }
}
function* handleCreateBranch(action) {
  try {
    const res = yield call(createBranch, action.payload);
    yield put(createBranchSuccess(res.data));
  } catch (err) {
    yield put(createBranchFailure(err.message));
  }
}
function* handleUpdateBranch(action) {
  try {
    const { id, data } = action.payload;
    const res = yield call(updateBranch, id, data);
    yield put(updateBranchSuccess(res.data));
  } catch (err) {
    yield put(updateBranchFailure(err.message));
  }
}

// ===== STATE =====
function* handleFetchStates(action) {
  try {
    const res = yield call(getStates, action.payload);
    yield put(fetchStatesSuccess(res.data));
  } catch (err) {
    console.log('Error fetching states:', err);
    yield put(fetchStatesFailure(err.message));
  }
}
function* handleFetchStateById(action) {
  try {
    const res = yield call(getStateById, action.payload);
    yield put(fetchStateByIdSuccess(res.data));
  } catch (err) {
    yield put(fetchStateByIdFailure(err.message));
  }
}
function* handleCreateState(action) {
  try {
    const res = yield call(createState, action.payload);
    yield put(createStateSuccess(res.data));
  } catch (err) {
    yield put(createStateFailure(err.message));
  }
}
function* handleUpdateState(action) {
  try {
    const { id, data } = action.payload;
    const res = yield call(updateState, id, data);
    yield put(updateStateSuccess(res.data));
  } catch (err) {
    yield put(updateStateFailure(err.message));
  }
}

// ===== DISTRICT =====
function* handleFetchDistricts(action) {
  try {
    const res = yield call(getDistricts, action.payload);
    yield put(fetchDistrictsSuccess(res.data));
  } catch (err) {
    yield put(fetchDistrictsFailure(err.message));
  }
}
function* handleFetchDistrictById(action) {
  try {
    const res = yield call(getDistrictById, action.payload);
    yield put(fetchDistrictByIdSuccess(res.data));
  } catch (err) {
    yield put(fetchDistrictByIdFailure(err.message));
  }
}
function* handleCreateDistrict(action) {
  try {
    const res = yield call(createDistrict, action.payload);
    yield put(createDistrictSuccess(res.data));
  } catch (err) {
    yield put(createDistrictFailure(err.message));
  }
}
function* handleUpdateDistrict(action) {
  try {
    const { id, data } = action.payload;
    const res = yield call(updateDistrict, id, data);
    yield put(updateDistrictSuccess(res.data));
  } catch (err) {
    yield put(updateDistrictFailure(err.message));
  }
}

// ===== CITY =====
function* handleFetchCities(action) {
  try {
    const res = yield call(getCities, action.payload);
    yield put(fetchCitiesSuccess(res.data));
  } catch (err) {
    yield put(fetchCitiesFailure(err.message));
  }
}
function* handleFetchCityById(action) {
  try {
    const res = yield call(getCityById, action.payload);
    yield put(fetchCityByIdSuccess(res.data));
  } catch (err) {
    yield put(fetchCityByIdFailure(err.message));
  }
}
function* handleCreateCity(action) {
  try {
    const res = yield call(createCity, action.payload);
    yield put(createCitySuccess(res.data));
  } catch (err) {
    yield put(createCityFailure(err.message));
  }
}
function* handleUpdateCity(action) {
  try {
    const { id, data } = action.payload;
    const res = yield call(updateCity, id, data);
    yield put(updateCitySuccess(res.data));
  } catch (err) {
    yield put(updateCityFailure(err.message));
  }
}

// ===== ZONE =====
function* handleFetchZones(action) {
  try {
    const res = yield call(getZones, action.payload);
    yield put(fetchZonesSuccess(res.data));
  } catch (err) {
    yield put(fetchZonesFailure(err.message));
  }
}
function* handleFetchZoneById(action) {
  try {
    const res = yield call(getZoneById, action.payload);
    yield put(fetchZoneByIdSuccess(res.data));
  } catch (err) {
    yield put(fetchZoneByIdFailure(err.message));
  }
}
function* handleCreateZone(action) {
  try {
    const res = yield call(createZone, action.payload);
    yield put(createZoneSuccess(res.data));
  } catch (err) {
    yield put(createZoneFailure(err.message));
  }
}
function* handleUpdateZone(action) {
  try {
    const { id, data } = action.payload;
    const res = yield call(updateZone, id, data);
    yield put(updateZoneSuccess(res.data));
  } catch (err) {
    yield put(updateZoneFailure(err.message));
  }
}

function* handleFetchBranchSummary(action) {
  try {
    const response = yield call(getBranchSummary, action.payload);
    yield put(fetchBranchSummarySuccess(response));
  } catch (error) {
    yield put(fetchBranchSummaryFailure(error.message));
  }
}

function* handleGeoMapProperties(action) {
  try {
    const { autoFetchNext = false, ...params } = action.payload;
    const response = yield call(getGeoMapProperties, params);
    yield put(fetchGeoMapPropertiesSuccess(response));
    if (autoFetchNext && response.currentPage < response.totalPages) {
      yield put(
        fetchGeoMapPropertiesRequest({
          ...params,
          page: response.currentPage + 1,
          autoFetchNext: true
        })
      );
    }
  } catch (error) {
    yield put(fetchGeoMapPropertiesFailure(error));
  }
}

function* handleGeoMapBranches(action) {
  try {
    const { autoFetchNext = false, ...params } = action.payload;
    const response = yield call(getGeoMapBranches, params);
    yield put(fetchGeoMapBranchesSuccess(response));
    if (autoFetchNext && response.currentPage < response.totalPages) {
      yield put(
        fetchGeoMapBranchesRequest({
          ...params,
          page: response.currentPage + 1,
          autoFetchNext: true
        })
      );
    }
  } catch (error) {
    yield put(fetchGeoMapBranchesFailure(error.message));
  }
}

// ===== Root Saga =====
export default function* locationSaga() {
  yield all([
    // Branch
    takeLatest(fetchBranchesRequest.type, handleFetchBranches),
    takeLatest(fetchBranchByIdRequest.type, handleFetchBranchById),
    takeLatest(createBranchRequest.type, handleCreateBranch),
    takeLatest(updateBranchRequest.type, handleUpdateBranch),

    // State
    takeLatest(fetchStatesRequest.type, handleFetchStates),
    takeLatest(fetchStateByIdRequest.type, handleFetchStateById),
    takeLatest(createStateRequest.type, handleCreateState),
    takeLatest(updateStateRequest.type, handleUpdateState),

    // District
    takeLatest(fetchDistrictsRequest.type, handleFetchDistricts),
    takeLatest(fetchDistrictByIdRequest.type, handleFetchDistrictById),
    takeLatest(createDistrictRequest.type, handleCreateDistrict),
    takeLatest(updateDistrictRequest.type, handleUpdateDistrict),

    // City
    takeLatest(fetchCitiesRequest.type, handleFetchCities),
    takeLatest(fetchCityByIdRequest.type, handleFetchCityById),
    takeLatest(createCityRequest.type, handleCreateCity),
    takeLatest(updateCityRequest.type, handleUpdateCity),

    // Zone
    takeLatest(fetchZonesRequest.type, handleFetchZones),
    takeLatest(fetchZoneByIdRequest.type, handleFetchZoneById),
    takeLatest(createZoneRequest.type, handleCreateZone),
    takeLatest(updateZoneRequest.type, handleUpdateZone),

    takeLatest(fetchBranchSummaryRequest.type, handleFetchBranchSummary),
    takeLatest(fetchGeoMapBranchesRequest.type, handleGeoMapBranches),
    takeLatest(fetchGeoMapPropertiesRequest.type, handleGeoMapProperties)
  ]);
}
