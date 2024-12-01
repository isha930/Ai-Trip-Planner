import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import CreateTrip from './create-trip/index.jsx';
import Header from './components/custom/Header.jsx';
import ErrorBoundary from './create-trip/ErrorBoundry.jsx';
import { Toaster } from 'sonner'; // Import the Toaster component
import { GoogleOAuthProvider } from '@react-oauth/google';
import Viewtrip from './view-trip/tripId/index.jsx';
import MyTrips from './my-trips/index.jsx';


const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/create-trip',
    element: (
      <ErrorBoundary>
        <CreateTrip />
      </ErrorBoundary>
    ),
  },
  {
    path: '/view-trip/:tripId',
    element: <Viewtrip />,
  },
  {
    path: '/my-trips',
    element: <MyTrips />,
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
      <Header />
      <Toaster /> {/* Add the Toaster component here */}
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  </StrictMode>,
);
