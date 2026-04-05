import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string;
}

const initialState: AuthState = {
  token: '',
};

export const authTokenSlice = createSlice({
  name: 'authorization',
  initialState,
  reducers: {
    setAuthToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    clearAuth: (state) => {
      state.token = '';
    },
  },
});

export const { setAuthToken, clearAuth } = authTokenSlice.actions;

export default authTokenSlice.reducer;
