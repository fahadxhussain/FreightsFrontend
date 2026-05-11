import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../index";

interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  permissions?: string[]; // Carrier team member permissions
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  permissions: string[]; // Flat permissions list for easy access
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isOnboardingComplete: false,
  permissions: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        accessToken: string;
        isOnboardingComplete: boolean;
        permissions?: string[];
      }>,
    ) => {
      const { user, accessToken, isOnboardingComplete, permissions } =
        action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.isOnboardingComplete = isOnboardingComplete;
      state.permissions = permissions || [];
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isOnboardingComplete = false;
      state.permissions = [];
    },
    updateOnboardingStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnboardingComplete = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { setCredentials, logout, updateOnboardingStatus, updateUser } =
  authSlice.actions;

/** Helper selector: check if current user has a specific permission */
export const hasPermission = (
  state: RootState,
  permission: string,
): boolean => {
  return state.auth.permissions.includes(permission);
};

export default authSlice.reducer;
