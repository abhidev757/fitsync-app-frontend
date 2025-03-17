import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import appRoutes from './routes/index.tsx'
import store from './store.ts'
import { Provider } from 'react-redux'
import { GoogleOAuthProvider } from '@react-oauth/google';

const router = createBrowserRouter(appRoutes)
console.log("Google Client ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>
    </GoogleOAuthProvider>
  </Provider>
);

