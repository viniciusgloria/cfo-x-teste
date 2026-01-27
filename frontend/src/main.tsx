import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { TopLoadingBar } from './components/ui/TopLoadingBar.tsx';

createRoot(document.getElementById('root')!).render(
  <>
    <TopLoadingBar />
    <App />
    <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
  </>
);
