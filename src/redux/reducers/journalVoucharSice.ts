import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Journal {
  date: any;
  partyAndBalance: string;
  crAnddr: any;
  amount: string;
  oppositeParty: string;
  remark: string;
}

const initialState: Journal[] = [];

const journalVoucharSlice = createSlice({
  name: 'journal',
  initialState,
  reducers: {
    addJournalVoucher: (state, action: PayloadAction<Journal>) => {
        const index = state.findIndex(company => company.oppositeParty === action.payload.oppositeParty);
      
        if (index !== -1) {
          state[index] = action.payload;
        } else {
          state.push(action.payload);
        }
      }
  },
});

export const { addJournalVoucher } = journalVoucharSlice.actions;
export default journalVoucharSlice.reducer;
