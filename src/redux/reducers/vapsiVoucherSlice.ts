import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Vapsi {
  date: any;
  partyAndBalance: string;
  crAnddr: any;
  amount: string;
  oppositeParty: string;
  remark: string;
}

const initialState: Vapsi[] = [];

const vapsiVoucharSlice = createSlice({
  name: 'vapsi',
  initialState,
  reducers: {
    addVapsiVoucher: (state, action: PayloadAction<Vapsi>) => {
        const index = state.findIndex(company => company.oppositeParty === action.payload.oppositeParty);
      
        if (index !== -1) {
          state[index] = action.payload;
        } else {
          state.push(action.payload);
        }
      }
  },
});

export const { addVapsiVoucher } = vapsiVoucharSlice.actions;
export default vapsiVoucharSlice.reducer;
