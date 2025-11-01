// store/branch/branchSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialEntityList = {
  data: [],
  totalCount: 0,
  totalPages: 1,
  currentPage: 1,
  perPage: 10
};

const initialState = {
  loading: false,
  error: null,

  states: { ...initialEntityList },
  districts: { ...initialEntityList },
  cities: { ...initialEntityList },
  zones: { ...initialEntityList },
  branches: { ...initialEntityList },

  state: null,
  district: null,
  city: null,
  zone: null,
  branch: null,

  branchSummary: {
    activeBranches: 0,
    zonesWithBranch: 0,
    districtsWithBranch: 0,
    statesWithBranch: 0
  },
  geoMapProperties: { ...initialEntityList },
  geoMapBranches: { ...initialEntityList }
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    // ===== State =====

    fetchStatesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchStatesSuccess: (state, action) => {
      state.loading = false;
      state.states = action.payload;
    },
    fetchStatesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchStateByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchStateByIdSuccess: (state, action) => {
      state.loading = false;
      state.state = action.payload;
    },
    fetchStateByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    createStateRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createStateSuccess: (state, action) => {
      state.loading = false;
      state.states.data = [action.payload, ...state.states.data];
      if (state.states.data.length > state.states.perPage) {
        state.states.data.pop();
      }
      state.states.totalCount += 1;
    },
    createStateFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateStateRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateStateSuccess: (state, action) => {
      state.loading = false;
      state.states.data = state.states.data.map((item) => (item.id === action.payload.id ? action.payload : item));
    },
    updateStateFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ===== District =====
    fetchDistrictsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDistrictsSuccess: (state, action) => {
      state.loading = false;
      state.districts = action.payload;
    },
    fetchDistrictsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchDistrictByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDistrictByIdSuccess: (state, action) => {
      state.loading = false;
      state.district = action.payload;
    },
    fetchDistrictByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    createDistrictRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createDistrictSuccess: (state, action) => {
      state.loading = false;
      state.districts.data = [action.payload, ...state.districts.data];
      if (state.districts.data.length > state.districts.perPage) {
        state.districts.data.pop();
      }
      state.districts.totalCount += 1;
    },
    createDistrictFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateDistrictRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateDistrictSuccess: (state, action) => {
      state.loading = false;
      state.districts.data = state.districts.data.map((item) => (item.id === action.payload.id ? action.payload : item));
    },
    updateDistrictFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    // ===== City =====
    fetchCitiesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCitiesSuccess: (state, action) => {
      state.loading = false;
      state.cities = action.payload;
    },
    fetchCitiesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchCityByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCityByIdSuccess: (state, action) => {
      state.loading = false;
      state.city = action.payload;
    },
    fetchCityByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    createCityRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createCitySuccess: (state, action) => {
      state.loading = false;
      state.cities.data = [action.payload, ...state.cities.data];
      if (state.cities.data.length > state.cities.perPage) {
        state.cities.data.pop();
      }
      state.cities.totalCount += 1;
    },
    createCityFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateCityRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateCitySuccess: (state, action) => {
      state.loading = false;
      state.cities.data = state.cities.data.map((item) => (item.id === action.payload.id ? action.payload : item));
    },
    updateCityFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    // ===== Zone =====
    fetchZonesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchZonesSuccess: (state, action) => {
      state.loading = false;
      state.zones = action.payload;
    },
    fetchZonesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchZoneByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchZoneByIdSuccess: (state, action) => {
      state.loading = false;
      state.zone = action.payload;
    },
    fetchZoneByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    createZoneRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createZoneSuccess: (state, action) => {
      state.loading = false;
      state.zones.data = [action.payload, ...state.zones.data];
      if (state.zones.data.length > state.zones.perPage) {
        state.zones.data.pop();
      }
      state.zones.totalCount += 1;
    },
    createZoneFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateZoneRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateZoneSuccess: (state, action) => {
      state.loading = false;
      state.zones.data = state.zones.data.map((item) => (item.id === action.payload.id ? action.payload : item));
    },
    updateZoneFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ===== Branch =====

    fetchBranchesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchBranchesSuccess: (state, action) => {
      state.loading = false;
      state.branches = action.payload;
    },
    fetchBranchesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchBranchByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchBranchByIdSuccess: (state, action) => {
      state.loading = false;
      state.branch = action.payload;
    },
    fetchBranchByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createBranchRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createBranchSuccess: (state, action) => {
      state.loading = false;
      state.branches.data = [action.payload, ...state.branches.data];

      if (state.branches.data.length > state.branches.perPage) {
        state.branches.data.pop();
      }
      state.branches.totalCount += 1;
    },
    createBranchFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateBranchRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateBranchSuccess: (state, action) => {
      state.loading = false;
      state.branches.data = state.branches.data.map((b) => (b.id === action.payload.id ? action.payload : b));
    },
    updateBranchFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchBranchSummaryRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchBranchSummarySuccess(state, action) {
      state.loading = false;
      state.branchSummary = action.payload;
    },
    fetchBranchSummaryFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    fetchGeoMapPropertiesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    fetchGeoMapPropertiesSuccess: (state, action) => {
      if (action?.payload?.data) {
        const isFirstPage = action.payload.currentPage === 1;
        state.loading = false;
        state.geoMapProperties = {
          data: isFirstPage ? action.payload.data : [...(state.geoMapProperties?.data || []), ...action.payload.data],
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          perPage: action.payload.perPage
        };
      }
    },

    fetchGeoMapPropertiesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchGeoMapBranchesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchGeoMapBranchesSuccess: (state, action) => {
      if (action?.payload?.data) {
        state.loading = false;
        state.geoMapBranches = {
          data: [...(state.geoMapBranches?.data || []), ...action.payload.data],
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          perPage: action.payload.perPage
        };
      }
    },

    fetchGeoMapBranchesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetGeoMapProperties: (state) => {
      state.geoMapProperties = initialEntityList;
    },
    resetGeoMapBranches: (state) => {
      state.geoMapBranches = initialEntityList;
    }
  }
});

export const {
  // ===== Branch =====
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

  // ===== Zone =====
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

  // ===== City =====
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

  // ===== District =====
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

  // ===== State =====
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

  fetchBranchSummaryRequest,
  fetchBranchSummarySuccess,
  fetchBranchSummaryFailure,

  fetchGeoMapPropertiesRequest,
  fetchGeoMapPropertiesSuccess,
  fetchGeoMapPropertiesFailure,

  fetchGeoMapBranchesRequest,
  fetchGeoMapBranchesSuccess,
  fetchGeoMapBranchesFailure,

  resetGeoMapProperties,
  resetGeoMapBranches
} = locationSlice.actions;

export default locationSlice.reducer;
