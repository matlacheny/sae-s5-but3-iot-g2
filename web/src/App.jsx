import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

// Pages existantes
import LoginPage from './pages/LoginPage.jsx';
import PatientPage from './pages/PatientPage';
import MedecinListPage from './pages/MedecinListPage';
import MedecinProfilePage from './pages/MedecinProfilePage';
import AideSoignantListPage from './pages/AideSoignantListPage';
import AideSoignantProfilePage from './pages/AideSoignantProfilePage';
import AssignAideSoignantPage from './pages/AssignAideSoignantPage';
import SignupPage from './pages/SignupPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Page de connexion - accessible sans authentification */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Pages Patient - protégées */}
          <Route 
            path="/patient" 
            element={
              <ProtectedRoute allowedRoles={['patients']}>
                <PatientPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/assign" 
            element={
              <ProtectedRoute allowedRoles={['patients']}>
                <AssignAideSoignantPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Pages Médecin - protégées */}
          <Route 
            path="/medecin" 
            element={
              <ProtectedRoute allowedRoles={['medecins']}>
                <MedecinListPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/medecin/profile" 
            element={
              <ProtectedRoute allowedRoles={['medecins']}>
                <MedecinProfilePage />
              </ProtectedRoute>
            } 
          />
          
          {/* Pages Aide-Soignant - protégées */}
          <Route 
            path="/aide-soignant" 
            element={
              <ProtectedRoute allowedRoles={['aidesoignants']}>
                <AideSoignantListPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/aide-soignant/profile" 
            element={
              <ProtectedRoute allowedRoles={['aidesoignants']}>
                <AideSoignantProfilePage />
              </ProtectedRoute>
            } 
          />

          <Route path="/signup" element={<SignupPage />} />
          
          {/* Redirection par défaut vers login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
