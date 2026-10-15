import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import APIService from '../../screens/services/APIService';
import {
    STALE_SESSION,
    getSessionToken,
    isStaleSession,
    withRetry,
} from '../sessionGuard';

export interface UserDetails {
    id?: number | string;
    username?: string;
    name?: string;
    real_name?: string;
    company_name?: string;
    user_role?: string | { id?: number | string; name?: string };
    role?: string;
    rate?: number | string;
    limit?: number | string;
    balance?: number | string;
    capping?: number | string;
    [key: string]: any;
}

interface UserState {
    userDetails: UserDetails | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: UserState = {
    userDetails: null,
    isLoading: false,
    error: null,
};

export const fetchUserDetails = createAsyncThunk(
    'user/fetchUserDetails',
    async (_, { rejectWithValue, getState }) => {
        const startToken = getSessionToken(getState);
        try {
            const res = await withRetry(
                () => APIService.GetMyDetails(),
                getState,
                startToken,
                (r: any) => !(r?.data?.data || r?.data || r),
            );
            if (isStaleSession(getState, startToken)) {
                return rejectWithValue(STALE_SESSION);
            }
            const user = res?.data?.data || res?.data || res;
            if (!user) {
                return rejectWithValue('Failed to fetch user details');
            }
            return user;
        } catch (err: any) {
            if (err?.message === STALE_SESSION || isStaleSession(getState, startToken)) {
                return rejectWithValue(STALE_SESSION);
            }
            return rejectWithValue(err?.message || 'Failed to fetch user details');
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserDetails: (state, action: PayloadAction<UserDetails | null>) => {
            state.userDetails = action.payload;
            state.error = null;
        },
        clearUserDetails: (state) => {
            state.userDetails = null;
            state.error = null;
            state.isLoading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserDetails.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserDetails.fulfilled, (state, action) => {
                state.isLoading = false;
                state.userDetails = action.payload;
                state.error = null;
            })
            .addCase(fetchUserDetails.rejected, (state, action) => {
                if (action.payload === STALE_SESSION) return;
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setUserDetails, clearUserDetails } = userSlice.actions;

export default userSlice.reducer;
