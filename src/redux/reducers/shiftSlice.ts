import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Shift {
  id?: string;
  name?: string;
  nextDay?: string;
  openTime?: string;
  closeTimeOwner?: string;
  owner?: string;
  superAdmin?: string;
  fanter?: string;
  cashAgent?: string; // Fixed: was caseAgent
  admin?: string;
  dataEntryOperator?: string;
  date?: string;
  addedBy?: string;
  updatedBy?: string;
  isActive?: string;
}

const initialState: Shift[] = [];

const shiftSlice = createSlice({
  name: 'shift',
  initialState,
  reducers: {
    addShift: (state, action: PayloadAction<Shift>) => {
    const index = state.findIndex(company => company.owner === action.payload.owner);
      
        if (index !== -1) {
          state[index] = action.payload;
        } else {
          state.push(action.payload);
        }
    },
    updateShift: (state, action: PayloadAction<{ id: string; data: Partial<Shift> }>) => {
      const { id, data } = action.payload;
      const index = state.findIndex(shift => shift.id === id);
      if (index !== -1) {
        state[index] = { ...state[index], ...data };
      }
    },
    deleteShift: (state, action: PayloadAction<string>) => {
      return state.filter(shift => shift.id !== action.payload);
    },
    clearShifts: (state) => {
      return [];
    },
  },
});

export const { addShift, updateShift, deleteShift, clearShifts } = shiftSlice.actions;
export default shiftSlice.reducer;