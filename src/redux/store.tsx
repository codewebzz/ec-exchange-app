import { configureStore } from '@reduxjs/toolkit'
import shiftReducer from './reducers/shiftSlice'
import companyReducer from './reducers/companySlice';
import journalVoucher from './reducers/journalVoucharSice';
import limitVoucher from './reducers/limitVoucherSlice';
import vapsiVoucher from './reducers/vapsiVoucherSlice';
import authTokenReducer from './reducers/authToken';
import permissionsReducer from './reducers/permissionsSlice';
export const store = configureStore({
  reducer: {
    company: companyReducer,
    shift:shiftReducer,
    journal:journalVoucher,
    limit:limitVoucher,
    vapsi:vapsiVoucher,
    authorization: authTokenReducer,
    permissions: permissionsReducer,
  },
})


export type AppDispatch = typeof store.dispatch