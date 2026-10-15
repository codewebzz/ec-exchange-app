import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import APIService from '../../screens/services/APIService';
import {
    STALE_SESSION,
    getSessionToken,
    isStaleSession,
    withRetry,
} from '../sessionGuard';

interface ShiftPermissionsState {
    shiftPermissions: number[];
    isLoading: boolean;
    error: string | null;
}

const initialState: ShiftPermissionsState = {
    shiftPermissions: [],
    isLoading: false,
    error: null,
};

export const fetchShiftPermissions = createAsyncThunk(
    'shiftPermissions/fetchShiftPermissions',
    async (_, { rejectWithValue, getState }) => {
        const startToken = getSessionToken(getState);
        try {
            const res = await withRetry(
                () => APIService.GetMyShiftPermissions(),
                getState,
                startToken,
                (r: any) => !r?.success,
            );
            if (isStaleSession(getState, startToken)) {
                return rejectWithValue(STALE_SESSION);
            }
            if (!res?.success) {
                return rejectWithValue(res?.message || 'Failed to fetch shift permissions');
            }
            if (Array.isArray(res?.data)) {
                return res.data.map((p: any) => p.shift_id) as number[];
            }
            return [];
        } catch (err: any) {
            if (err?.message === STALE_SESSION || isStaleSession(getState, startToken)) {
                return rejectWithValue(STALE_SESSION);
            }
            return rejectWithValue(err?.message || 'Failed to fetch shift permissions');
        }
    }
);

const shiftPermissionsSlice = createSlice({
    name: 'shiftPermissions',
    initialState,
    reducers: {
        setShiftPermissions: (state, action: PayloadAction<number[]>) => {
            state.shiftPermissions = action.payload;
            state.error = null;
        },
        clearShiftPermissions: (state) => {
            state.shiftPermissions = [];
            state.error = null;
            state.isLoading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchShiftPermissions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchShiftPermissions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.shiftPermissions = action.payload;
                state.error = null;
            })
            .addCase(fetchShiftPermissions.rejected, (state, action) => {
                if (action.payload === STALE_SESSION) return;
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setShiftPermissions, clearShiftPermissions } = shiftPermissionsSlice.actions;

export default shiftPermissionsSlice.reducer;
