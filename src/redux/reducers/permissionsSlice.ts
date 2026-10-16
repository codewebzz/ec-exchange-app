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
    async (force: boolean | undefined, { rejectWithValue, getState }) => {
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
                const currentToken = getSessionToken(getState);
                console.warn('⚠️ [fetchUserPermissions] Session became stale:', {
                    startToken: startToken ? `${startToken.slice(0, 15)}...` : '(empty)',
                    currentToken: currentToken ? `${currentToken.slice(0, 15)}...` : '(empty)',
                    backendResponse: res,
                });
                return rejectWithValue(STALE_SESSION);
            }
            if (!res?.success) {
                console.error('❌ [fetchUserPermissions BE Error]:', res);
                return rejectWithValue(res?.message || res?.Description || 'Failed to fetch permissions');
            }
            return (res.permissions || []) as PermissionValue[];
        } catch (err: any) {
            console.error('❌ [fetchUserPermissions Catch Error]:', err?.response?.data || err?.message || err);
            if (err?.message === STALE_SESSION || isStaleSession(getState, startToken)) {
                return rejectWithValue(STALE_SESSION);
            }
            return rejectWithValue(err?.response?.data?.message || err?.message || 'Failed to fetch permissions');
        }
    },
    {
        condition: (force, { getState }) => {
            const { permissions } = getState() as any;
            if (permissions?.isLoading) {
                return false;
            }
            if (permissions?.userPermissions?.length > 0 && !force) {
                return false;
            }
            return true;
        },
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
