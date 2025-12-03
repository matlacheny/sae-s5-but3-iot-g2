import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import des 6 pages
import PatientPage from './pages/PatientPage';
import MedecinListPage from './pages/MedecinListPage';
import MedecinProfilePage from './pages/MedecinProfilePage';
import AideSoignantListPage from './pages/AideSoignantListPage';
import AideSoignantProfilePage from './pages/AideSoignantProfilePage';
import AssignAideSoignantPage from './pages/AssignAideSoignantPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Page Patient */}
        <Route path="/patient" element={<PatientPage />} />
        
        {/* Pages Médecin */}
        <Route path="/medecin" element={<MedecinListPage />} />
        <Route path="/medecin/profile" element={<MedecinProfilePage />} />
        
        {/* Pages Aide-Soignant */}
        <Route path="/aide-soignant" element={<AideSoignantListPage />} />
        <Route path="/aide-soignant/profile" element={<AideSoignantProfilePage />} />
        
        {/* Page Assignation */}
        <Route path="/assign" element={<AssignAideSoignantPage />} />
        
        {/* Page par défaut */}
        <Route path="/" element={<PatientPage />} />
      </Routes>
    </Router>
  );
}

export default App;
