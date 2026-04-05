import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Company {
  companyName: string;
  printName: string;
  shortName: string;
  country: string;
  state: string;
  pincode: string;
  pan: string;
  mobile: string;
  email: string;
  username: string;
  password: string;
}

const initialState: Company[] = [];

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    addCompany: (state, action: PayloadAction<Company>) => {
        const index = state.findIndex(company => company.username === action.payload.username);
      
        if (index !== -1) {
          state[index] = action.payload;
        } else {
          state.push(action.payload);
        }
      }
  },
});

export const { addCompany } = companySlice.actions;
export default companySlice.reducer;
