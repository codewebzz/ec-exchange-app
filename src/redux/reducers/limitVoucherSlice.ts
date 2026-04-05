import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Limit {
  date: any;
  partyAndLimit: string;
  
lenaAndDena: any;
  amount: string;
  oppositeParty: string;
  remark: string;
}

const initialState: Limit[] = [];

const limitVoucharSlice = createSlice({
  name: 'limit',
  initialState,
  reducers: {
    addLimitVoucher: (state, action: PayloadAction<Limit>) => {
        const index = state.findIndex(company => company.oppositeParty === action.payload.oppositeParty);
      
        if (index !== -1) {
          state[index] = action.payload;
        } else {
          state.push(action.payload);
        }
      }
  },
});

export const { addLimitVoucher } = limitVoucharSlice.actions;
export default limitVoucharSlice.reducer;
