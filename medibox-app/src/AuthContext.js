import React, { createContext, useContext, useState, useEffect } from 'react';

const API_KEY = "9769a0eab09284d4bfeef45e4103642cf00b1b17f15f65afeb4f336890e37e63";
const API_PATH = "https://apidatabasesae-aee3egcmdke2b6a2.germanywestcentral-01.azurewebsites.net/api";

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
    const savedUser = sessionStorage.getItem('mediapp_user');
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
            sessionStorage.setItem('mediapp_user', JSON.stringify(userInfo));
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
    sessionStorage.removeItem('mediapp_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};