import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Trainer {
  _id: string;
  name: string;
  email: string;
  isGoogleLogin?: boolean;
}

interface TrainerAuthState {
  trainerInfo: Trainer | null;
}

const initialState: TrainerAuthState = {
  trainerInfo: localStorage.getItem('trainerInfo') ? JSON.parse(localStorage.getItem('trainerInfo') as string) : null,
};

const trainerAuthSlice = createSlice({
  name: 'trainerAuth',
  initialState,
  reducers: {
    setTrainerCredentials: (state, action: PayloadAction<Trainer>) => {
      console.log('creeeeeeeeeeeeeeeeeeeeeeeeeeee');
      
      state.trainerInfo = action.payload;
      localStorage.setItem('trainerInfo', JSON.stringify(action.payload));
    },
    // Logout Trainer
    logoutTrainer: (state) => {
      state.trainerInfo = null;
      localStorage.removeItem('trainerInfo');
    },
  },
});

export const { setTrainerCredentials, logoutTrainer } = trainerAuthSlice.actions;
export default trainerAuthSlice.reducer;
