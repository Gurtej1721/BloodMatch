import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';

import HomePage from './pages/HomePage';
import RequestPage from './pages/RequestPage';
import MatcherPage from './pages/MatcherPage';
import DirectoryPage from './pages/DirectoryPage';
import ReservesPage from './pages/ReservesPage';
import DonorPage from './pages/DonorPage';
import HospitalsPage from './pages/HospitalsPage';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="request" element={<RequestPage />} />
            <Route path="matcher" element={<MatcherPage />} />
            <Route path="directory" element={<DirectoryPage />} />
            <Route path="reserves" element={<ReservesPage />} />
            <Route path="donor" element={<DonorPage />} />
            <Route path="hospitals" element={<HospitalsPage />} />
            <Route path="network" element={<HospitalsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;