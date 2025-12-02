import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import des pages
import PatientPage from './pages/PatientPage';
import MedecinListPage from './pages/MedecinListPage';
import MedecinProfilePage from './pages/MedecinProfilePage';
import AideSoignantListPage from './pages/AideSoignantListPage';
import AideSoignantProfilePage from './pages/AideSoignantProfilePage';
import AssignAideSoignantPage from './pages/AssignAideSoignantPage';

// Import des styles globaux
import './App.css';

/**
 * Composant principal de l'application MediBox
 * Gère le routing entre les différentes pages selon les profils :
 * - Patient
 * - Médecin
 * - Aide-Soignant
 */
function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* ==================== ROUTES PATIENT ==================== */}
          
          {/* Page principale du patient avec ses informations */}
          <Route 
            path="/patient" 
            element={<PatientPage />} 
          />

          {/* ==================== ROUTES MÉDECIN ==================== */}
          
          {/* Liste de tous les patients pour le médecin */}
          <Route 
            path="/medecin" 
            element={<MedecinListPage />} 
          />
          
          {/* Profil détaillé d'un patient vu par le médecin */}
          <Route 
            path="/medecin/profile" 
            element={<MedecinProfilePage />} 
          />

          {/* ==================== ROUTES AIDE-SOIGNANT ==================== */}
          
          {/* Liste de tous les patients pour l'aide-soignant */}
          <Route 
            path="/aide-soignant" 
            element={<AideSoignantListPage />} 
          />
          
          {/* Profil détaillé d'un patient vu par l'aide-soignant */}
          {/* Inclut la configuration des compartiments et les alertes */}
          <Route 
            path="/aide-soignant/profile" 
            element={<AideSoignantProfilePage />} 
          />

          {/* ==================== ROUTES COMMUNES ==================== */}
          
          {/* Page d'assignation d'un aide-soignant à un patient */}
          <Route 
            path="/assign" 
            element={<AssignAideSoignantPage />} 
          />

          {/* ==================== ROUTE PAR DÉFAUT ==================== */}
          
          {/* Redirection de la racine vers la page patient */}
          <Route 
            path="/" 
            element={<Navigate to="/patient?idPatient=pat1" replace />} 
          />

          {/* Route 404 - Page non trouvée */}
          <Route 
            path="*" 
            element={
              <div style={{ 
                padding: '50px', 
                textAlign: 'center',
                fontFamily: 'Arial, sans-serif'
              }}>
                <h1 style={{ color: '#d32f2f' }}>404 - Page non trouvée</h1>
                <p>La page que vous recherchez n'existe pas.</p>
                <button 
                  onClick={() => window.location.href = '/'}
                  style={{
                    backgroundColor: '#4a73d9',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginTop: '20px'
                  }}
                >
                  Retour à l'accueil
                </button>
              </div>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;