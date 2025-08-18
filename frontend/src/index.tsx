// src/index.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import App from './App';
import theme from './theme';
import { CardProvider } from './contexts/CardContext';
import { CartProvider } from './contexts/CartContext';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <CardProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </CardProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
serviceWorkerRegistration.register();