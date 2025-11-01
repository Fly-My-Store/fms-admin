import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activities: [],
  activity: null,

  activityTypes: [],
  activityType: null,

  activityLevels: [],
  activityLevel: null,

  loading: false,
  error: null
};

const constructionActivitySlice = createSlice({
  name: 'constructionActivity',
  initialState,
  reducers: {
    // ====== ACTIVITY ======
    fetchActivitiesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchActivitiesSuccess: (state, action) => {
      state.loading = false;
      state.activities = action.payload;
    },
    fetchActivitiesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchActivityByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchActivityByIdSuccess: (state, action) => {
      state.loading = false;
      state.activity = action.payload;
    },
    fetchActivityByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    createActivityRequest: (state) => {
      state.loading = true;
    },
    createActivitySuccess: (state, action) => {
      state.loading = false;
      state.activities.unshift(action.payload);
      state.activities.sort((a, b) => {
        const typeSeqA = a.activityType?.sequence ?? 0;
        const typeSeqB = b.activityType?.sequence ?? 0;
        if (typeSeqA !== typeSeqB) return typeSeqA - typeSeqB;
        return (a.sequence ?? 0) - (b.sequence ?? 0);
      });
    },
    createActivityFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateActivityRequest: (state) => {
      state.loading = true;
    },
    updateActivitySuccess: (state, action) => {
      state.loading = false;
      state.activities = [action.payload, ...state.activities.filter((item) => item.id !== action.payload.id)];
      state.activities.sort((a, b) => {
        const typeSeqA = a.activityType?.sequence ?? 0;
        const typeSeqB = b.activityType?.sequence ?? 0;
        if (typeSeqA !== typeSeqB) return typeSeqA - typeSeqB;
        return (a.sequence ?? 0) - (b.sequence ?? 0);
      });
    },
    updateActivityFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateActivitySequenceRequest: (state) => {
      state.loading = true;
    },
    updateActivitySequenceSuccess: (state, action) => {
      state.loading = false;
      state.activities = action.payload;
      state.activities.sort((a, b) => {
        const typeSeqA = a.activityType?.sequence ?? 0;
        const typeSeqB = b.activityType?.sequence ?? 0;
        if (typeSeqA !== typeSeqB) return typeSeqA - typeSeqB;
        return (a.sequence ?? 0) - (b.sequence ?? 0);
      });
    },
    updateActivitySequenceFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ====== ACTIVITY TYPES ======
    fetchActivityTypesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchActivityTypesSuccess: (state, action) => {
      state.loading = false;
      state.activityTypes = action.payload;
    },
    fetchActivityTypesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchActivityTypeByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchActivityTypeByIdSuccess: (state, action) => {
      state.loading = false;
      state.activityType = action.payload;
    },
    fetchActivityTypeByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    createActivityTypeRequest: (state) => {
      state.loading = true;
    },
    createActivityTypeSuccess: (state, action) => {
      state.loading = false;
      state.activityTypes.unshift(action.payload);
      state.activityTypes.sort((a, b) => a.sequence - b.sequence);
    },
    createActivityTypeFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateActivityTypeRequest: (state) => {
      state.loading = true;
    },
    updateActivityTypeSuccess: (state, action) => {
      state.loading = false;
      state.activityTypes = [action.payload, ...state.activityTypes.filter((item) => item.id !== action.payload.id)];
      state.activityTypes.sort((a, b) => a.sequence - b.sequence);
    },
    updateActivityTypeFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateActivityTypeSequenceRequest: (state) => {
      state.loading = true;
    },
    updateActivityTypeSequenceSuccess: (state, action) => {
      state.loading = false;
      state.activityTypes = action.payload;
      state.activityTypes.sort((a, b) => a.sequence - b.sequence);
    },
    updateActivityTypeSequenceFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ====== ACTIVITY LEVELS ======
    fetchActivityLevelsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchActivityLevelsSuccess: (state, action) => {
      state.loading = false;
      state.activityLevels = action.payload;
    },
    fetchActivityLevelsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchActivityLevelByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchActivityLevelByIdSuccess: (state, action) => {
      state.loading = false;
      state.activityLevel = action.payload;
    },
    fetchActivityLevelByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    createActivityLevelRequest: (state) => {
      state.loading = true;
    },
    createActivityLevelSuccess: (state, action) => {
      state.loading = false;
      state.activityLevels.unshift(action.payload);
    },
    createActivityLevelFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateActivityLevelRequest: (state) => {
      state.loading = true;
    },
    updateActivityLevelSuccess: (state, action) => {
      state.loading = false;
      state.activityLevels = [action.payload, ...state.activityLevels.filter((item) => item.id !== action.payload.id)];
    },
    updateActivityLevelFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const {
  fetchActivitiesRequest,
  fetchActivitiesSuccess,
  fetchActivitiesFailure,
  fetchActivityByIdRequest,
  fetchActivityByIdSuccess,
  fetchActivityByIdFailure,
  createActivityRequest,
  createActivitySuccess,
  createActivityFailure,
  updateActivityRequest,
  updateActivitySuccess,
  updateActivityFailure,
  updateActivitySequenceRequest,
  updateActivitySequenceSuccess,
  updateActivitySequenceFailure,

  fetchActivityTypesRequest,
  fetchActivityTypesSuccess,
  fetchActivityTypesFailure,
  fetchActivityTypeByIdRequest,
  fetchActivityTypeByIdSuccess,
  fetchActivityTypeByIdFailure,
  createActivityTypeRequest,
  createActivityTypeSuccess,
  createActivityTypeFailure,
  updateActivityTypeRequest,
  updateActivityTypeSuccess,
  updateActivityTypeFailure,
  updateActivityTypeSequenceRequest,
  updateActivityTypeSequenceSuccess,
  updateActivityTypeSequenceFailure,

  fetchActivityLevelsRequest,
  fetchActivityLevelsSuccess,
  fetchActivityLevelsFailure,
  fetchActivityLevelByIdRequest,
  fetchActivityLevelByIdSuccess,
  fetchActivityLevelByIdFailure,
  createActivityLevelRequest,
  createActivityLevelSuccess,
  createActivityLevelFailure,
  updateActivityLevelRequest,
  updateActivityLevelSuccess,
  updateActivityLevelFailure
} = constructionActivitySlice.actions;

export default constructionActivitySlice.reducer;
