import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import FormPage from './pages/FormPage';
import SubmissionsPage from './pages/SubmissionsPage';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  { path: '/', element: <FormPage /> },
  { path: '/submissions', element: <SubmissionsPage /> }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
