import { combineReducers } from '@reduxjs/toolkit';

import authReducer from './auth/authSlice';
import userReducer from './user/userSlice';
import iam from './iam/slice';
import catalog from './catalog/slice';
import attributes from './attributes/slice';
import sellersStores from './sellersStores/slice';
import listingsInventory from './listingsInventory/slice';
import ordersPayments from './ordersPayments/slice';
import logistics from './logistics/slice';
import content from './content/slice';
import geo from './geo/slice';
import integrations from './integrations/slice';
import audit from './audit/slice';

const appReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  iam,
  catalog,
  attributes,
  sellersStores,
  listingsInventory,
  ordersPayments,
  logistics,
  content,
  geo,
  integrations,
  audit
});

export const rootReducer = (state, action) => {
  if (action.type === 'auth/logout') {
    state = undefined;
  }
  return appReducer(state, action);
};
