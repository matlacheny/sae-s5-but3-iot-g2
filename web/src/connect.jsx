import React, { useState, createContext, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

const API_KEY = "9769a0eab09284d4bfeef45e4103642cf00b1b17f15f65afeb4f336890e37e63";
const API_PATH = "https://apidatabasesae-aee3egcmdke2b6a2.germanywestcentral-01.azurewebsites.net/api";

// Context pour gérer l'authentification
const AuthContext = createContext(null);

// Hook personnalisé pour utiliser le contexte d'authentification
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

// Provider d'authentification
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si un utilisateur est déjà connecté au chargement
    const savedUser = sessionStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (id, password) => {
    const roles = [
      { name: 'medecins', redirectTo: '/medecin', idField: 'id_medecin' },
      { name: 'patients', redirectTo: '/patient', idField: 'id_patient' },
      { name: 'aidesoignants', redirectTo: '/aide-soignant', idField: 'id_aide_soignant' }
    ];

    for (const role of roles) {
      try {
        const response = await fetch(`${API_PATH}/${role.name}/${id}`, {
          method: "GET",
          headers: {
            api_key: API_KEY,
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          const userData = await response.json();
          
          if (userData.mot_de_passe === password) {
            const userInfo = {
              id: userData[role.idField],
              role: role.name,
              redirectTo: role.redirectTo,
              data: userData
            };
            
            setUser(userInfo);
            sessionStorage.setItem('user', JSON.stringify(userInfo));
            return { success: true, user: userInfo };
          }
        }
      } catch (error) {
        console.error(`Erreur lors de la vérification pour ${role.name}:`, error);
      }
    }

    return { success: false, message: "Identifiant ou mot de passe invalide" };
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Composant de route protégée
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Chargement...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.redirectTo} replace />;
  }

  return children;
};

// Page de connexion
const LoginPage = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.redirectTo);
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!id || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    const result = await login(id, password);
    setLoading(false);

    if (result.success) {
      navigate(result.user.redirectTo);
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8f8f8',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#2b4c7e', margin: '0 0 10px 0' }}>MediAPP</h1>
          <p style={{ color: '#666', margin: 0 }}>Connexion à votre espace</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontWeight: 'bold'
            }}>
              Identifiant
            </label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Entrez votre identifiant"
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontWeight: 'bold'
            }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Entrez votre mot de passe"
              disabled={loading}
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fee',
              color: '#c33',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '14px',
              border: '1px solid #fcc'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading ? '#ccc' : '#4a73d9',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s'
            }}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <div style={{
          marginTop: '30px',
          padding: '15px',
          backgroundColor: '#f0f8ff',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#666'
        }}>
          <strong>Exemples de connexion:</strong>
          <div style={{ marginTop: '8px' }}>
            <div>• Patient: jdupont123 / SuperSecret2024</div>
            <div>• Aide-soignant: aso1 / pwd123</div>
            <div>• Médecin: med1 / mdpmed1</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant de déconnexion (bouton à ajouter dans vos pages)
const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: '8px 16px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px'
      }}
    >
      Déconnexion
    </button>
  );
};

// Pages exemples (vous remplacerez par vos vraies pages)
const PatientPage = () => {
  const { user } = useAuth();
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Espace Patient</h1>
        <LogoutButton />
      </div>
      <p>Bienvenue {user?.data?.prenom} {user?.data?.nomFamille}</p>
      <p>ID Patient: {user?.id}</p>
    </div>
  );
};

const MedecinPage = () => {
  const { user } = useAuth();
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Espace Médecin</h1>
        <LogoutButton />
      </div>
      <p>Bienvenue Dr {user?.data?.prenom} {user?.data?.nomFamille}</p>
      <p>ID Médecin: {user?.id}</p>
    </div>
  );
};

const AideSoignantPage = () => {
  const { user } = useAuth();
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Espace Aide-Soignant</h1>
        <LogoutButton />
      </div>
      <p>Bienvenue {user?.data?.prenom} {user?.data?.nomFamille}</p>
      <p>ID Aide-Soignant: {user?.id}</p>
    </div>
  );
};

// Application principale
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route 
            path="/patient" 
            element={
              <ProtectedRoute allowedRoles={['patients']}>
                <PatientPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/medecin" 
            element={
              <ProtectedRoute allowedRoles={['medecins']}>
                <MedecinPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/aide-soignant" 
            element={
              <ProtectedRoute allowedRoles={['aidesoignants']}>
                <AideSoignantPage />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;