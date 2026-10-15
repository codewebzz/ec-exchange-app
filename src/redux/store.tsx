import { combineReducers, configureStore, UnknownAction } from '@reduxjs/toolkit'
import shiftReducer from './reducers/shiftSlice'
import companyReducer from './reducers/companySlice';
import journalVoucher from './reducers/journalVoucharSice';
import limitVoucher from './reducers/limitVoucherSlice';
import vapsiVoucher from './reducers/vapsiVoucherSlice';
import authTokenReducer, { clearAuth } from './reducers/authToken';
import permissionsReducer from './reducers/permissionsSlice';
import shiftPermissionsReducer from './reducers/shiftPermissionsSlice';
import userReducer from './reducers/userSlice';

const appReducer = combineReducers({
  company: companyReducer,
  shift: shiftReducer,
  journal: journalVoucher,
  limit: limitVoucher,
  vapsi: vapsiVoucher,
  authorization: authTokenReducer,
  permissions: permissionsReducer,
  shiftPermissions: shiftPermissionsReducer,
  user: userReducer,
});

// Logging out (clearAuth) wipes EVERY slice back to its initial state, so no data from the
// previous user/session can leak into the next login, whichever logout path was used.
const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: UnknownAction) => {
  if (clearAuth.match(action)) {
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
})


export type AppDispatch = typeof store.dispatch