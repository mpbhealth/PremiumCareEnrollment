import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

if (import.meta.env.PROD) {
  const devtools = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (devtools && typeof devtools === 'object') {
    for (const key of Object.keys(devtools)) {
      if (typeof devtools[key] === 'function') {
        devtools[key] = () => {};
      }
    }
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
