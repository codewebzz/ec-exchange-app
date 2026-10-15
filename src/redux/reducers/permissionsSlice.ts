import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import APIService from '../../screens/services/APIService';
import {
    STALE_SESSION,
    getSessionToken,
    isStaleSession,
    withRetry,
} from '../sessionGuard';

export type PermissionValue = string;

interface PermissionsState {
    userPermissions: PermissionValue[];
    isLoading: boolean;
    error: string | null;
}

const initialState: PermissionsState = {
    userPermissions: [],
    isLoading: false,
    error: null,
};

export const fetchUserPermissions = createAsyncThunk(
    'permissions/fetchUserPermissions',
    async (_, { rejectWithValue, getState }) => {
        const startToken = getSessionToken(getState);
        try {
            const res = await withRetry(
                () => APIService.GetMyPermissions(),
                getState,
                startToken,
                (r: any) => !r?.success,
            );
            // Response belongs to a previous login -> never write it into the store
            if (isStaleSession(getState, startToken)) {
                return rejectWithValue(STALE_SESSION);
            }
            if (!res?.success) {
                return rejectWithValue(res?.message || 'Failed to fetch permissions');
            }
            return res.permissions as PermissionValue[];
        } catch (err: any) {
            if (err?.message === STALE_SESSION || isStaleSession(getState, startToken)) {
                return rejectWithValue(STALE_SESSION);
            }
            return rejectWithValue(err?.message || 'Failed to fetch permissions');
        }
    }
);

const permissionsSlice = createSlice({
    name: 'permissions',
    initialState,
    reducers: {
        setPermissions: (state, action: PayloadAction<PermissionValue[]>) => {
            state.userPermissions = action.payload;
            state.error = null;
        },
        clearPermissions: (state) => {
            state.userPermissions = [];
            state.error = null;
            state.isLoading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserPermissions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserPermissions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.userPermissions = action.payload;
                state.error = null;
            })
            .addCase(fetchUserPermissions.rejected, (state, action) => {
                // Stale (previous-session) result: leave current state untouched
                if (action.payload === STALE_SESSION) return;
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setPermissions, clearPermissions } = permissionsSlice.actions;

export default permissionsSlice.reducer;
