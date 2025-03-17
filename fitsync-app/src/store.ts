import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import trainerAuthReducer from "./slices/trainerAuthSlice"; 
import { ThunkAction, Action } from '@reduxjs/toolkit';
import { apiSlice } from './slices/apiSlice';
import adminAuthReducer from "./slices/adminAuthSlice"

const store = configureStore({
  reducer: {
    auth: authReducer,
    trainerAuth: trainerAuthReducer,
    adminAuth: adminAuthReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export default store;
