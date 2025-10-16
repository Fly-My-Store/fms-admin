import { combineReducers } from '@reduxjs/toolkit';
import auth from './slices/authSlice';
import users from './slices/usersSlice';
import vendors from './slices/vendorsSlice';
import orders from './slices/ordersSlice';
import payouts from './slices/payoutsSlice';
import ui from './slices/uiSlice';

export default combineReducers({ auth, users, vendors, orders, payouts, ui });
