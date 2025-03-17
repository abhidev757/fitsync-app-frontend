import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Admin {
  id: string;
  name: string;
  email: string;
}

interface AdminAuthState {
  adminInfo: Admin | null;
}

const initialState: AdminAuthState = {
  adminInfo: localStorage.getItem('adminInfo') ? JSON.parse(localStorage.getItem('adminInfo') as string) : null,
};

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    setAdminCredentials: (state, action: PayloadAction<Admin>) => {
      console.log('creeeeeeeeeeeeeeeeeeeeeeeeeeee');
      
      state.adminInfo = action.payload;
      localStorage.setItem('adminInfo', JSON.stringify(action.payload));
    },
    // Logout admin
    logoutAdmin: (state) => {
      state.adminInfo = null;
      localStorage.removeItem('adminInfo');
    },
  },
});

export const { setAdminCredentials, logoutAdmin } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
