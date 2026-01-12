import React, { createContext, useContext, useState, useEffect } from 'react';
import SERVER_CONFIG from './config/serverConfig';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('mediapp_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Erreur chargement session:', error);
        localStorage.removeItem('mediapp_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (id, password) => {
    const roles = [
      { name: 'medecins', redirectTo: '/medecin', idField: 'id_medecin' },
      { name: 'patients', redirectTo: '/patient', idField: 'id_patient' },
      { name: 'aidesoignants', redirectTo: '/aide-soignant', idField: 'id_aide_soignant' }
    ];

    // Récupérer l'URL du serveur depuis le Gist
    let serverUrl;
    try {
      serverUrl = await SERVER_CONFIG.getServerUrl();
      console.log(' [LOGIN] URL serveur récupérée:', serverUrl);
    } catch (error) {
      console.error('❌ [LOGIN] Impossible de récupérer la config:', error);
      return { 
        success: false, 
        message: "Impossible de se connecter au serveur. Vérifiez votre connexion." 
      };
    }

    for (const role of roles) {
      try {
        console.log(`[LOGIN] Tentative ${role.name}/${id}`);
        
        const response = await fetch(`${serverUrl}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true", // Pour éviter l'avertissement Ngrok
            "token": SERVER_CONFIG.API_KEY,
          },
          body: JSON.stringify({
            id: id,
            password: password,
            //token : SERVER_CONFIG.API_KEY,
            role: role.name
          })
        });
        console.log(SERVER_CONFIG.API_KEY);
        console.log(`[LOGIN] Status: ${response.status}`);

        if (response.ok) {
          const result = await response.json();
          
          if (!result || !result.user) {
            console.log(`[LOGIN] Pas de données pour ${role.name}`);
            continue;
          }

          const userData = result.user;
          console.log(`[LOGIN] ✅ Succès ${role.name}`);
          
          const userInfo = {
            id: userData[role.idField],
            role: role.name,
            redirectTo: role.redirectTo,
            data: userData
          };
          
          setUser(userInfo);
          localStorage.setItem('mediapp_user', JSON.stringify(userInfo));
          return { success: true, user: userInfo };
        } else if (response.status === 401) {
          console.log(`[LOGIN] ❌ Mot de passe incorrect pour ${role.name}`);
        } else if (response.status === 404) {
          console.log(`[LOGIN] ❌ Utilisateur non trouvé pour ${role.name}`);
        }
      } catch (error) {
        console.error(`[LOGIN] Erreur ${role.name}:`, error);
      }
    }

    console.log('❌ [LOGIN] Échec pour tous les rôles');
    return { success: false, message: "Identifiant ou mot de passe invalide" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mediapp_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
