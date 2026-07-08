import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('theme', theme);
};

const initialTheme = getInitialTheme();
applyTheme(initialTheme);

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: initialTheme,
    mobileNavOpen: false,
  },
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(state.theme);
    },
    setMobileNavOpen: (state, action) => {
      state.mobileNavOpen = action.payload;
    },
  },
});

export const { toggleTheme, setMobileNavOpen } = uiSlice.actions;
export default uiSlice.reducer;
