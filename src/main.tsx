import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import AppRouter from './router/AppRouter'
import { firebaseInitialize } from './utils/firebase'
import { supabaseInitialize } from './utils/supabase'

firebaseInitialize();
supabaseInitialize();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
        <AppRouter />
    </BrowserRouter>
  </StrictMode>,
)
