import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SERVER_CONFIG from '../config/serverConfig';

const SignupPage = () => {
  const [accountType, setAccountType] = useState('aidesoignant');
  const [formData, setFormData] = useState({
    nomFamille: '',
    prenom: '',
    date_naissance: '',
    sexe: '',
    adresse_postale: '',
    adresse_electronique: '',
    mot_de_passe: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    // Validation
    if (!formData.nomFamille || !formData.prenom || !formData.mot_de_passe) {
      setError('Les champs Nom, Prénom et Mot de passe sont obligatoires');
      return;
    }

    if (formData.mot_de_passe !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.mot_de_passe.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      const serverUrl = await SERVER_CONFIG.getServerUrl();
      const endpoint = accountType === 'aidesoignant' 
        ? '/api/auth/signup/aidesoignant'
        : '/api/auth/signup/medecin';

      const response = await fetch(`${serverUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          nomFamille: formData.nomFamille,
          prenom: formData.prenom,
          date_naissance: formData.date_naissance || null,
          sexe: formData.sexe || 'U',
          adresse_postale: formData.adresse_postale || null,
          adresse_electronique: formData.adresse_electronique || null,
          mot_de_passe: formData.mot_de_passe
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess({
          message: data.message,
          id: data.id
        });
        
      } else {
        setError(data.error || 'Erreur lors de la création du compte');
      }
    } catch (err) {
      console.error('Erreur inscription:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

// Fonction pour copier l'ID dans le presse-papiers
const copyToClipboard = () => {
  if (success?.id) {
    navigator.clipboard.writeText(success.id);
    alert('Identifiant copié dans le presse-papiers !');
  }
};



  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8f8f8',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '500px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#2b4c7e', margin: '0 0 10px 0' }}>MediAPP</h1>
          <p style={{ color: '#666', margin: 0 }}>Créer un compte</p>
        </div>
{success ? (
  <div style={{ textAlign: 'center' }}>
    <div style={{
      backgroundColor: '#d4edda',
      color: '#155724',
      padding: '30px',
      borderRadius: '12px',
      border: '2px solid #28a745',
      marginBottom: '20px'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '15px' }}>✅</div>
      <h2 style={{ margin: '0 0 20px 0', color: '#155724' }}>
        Compte créé avec succès !
      </h2>
      
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '2px dashed #28a745'
      }}>
        <p style={{ 
          margin: '0 0 10px 0', 
          fontSize: '14px',
          color: '#666',
          fontWeight: 'bold'
        }}>
          📋 NOTEZ BIEN VOTRE IDENTIFIANT :
        </p>
        <p style={{ 
          margin: '10px 0', 
          fontSize: '28px', 
          fontWeight: 'bold',
          color: '#155724',
          letterSpacing: '2px',
          fontFamily: 'monospace',
          wordBreak: 'break-all'
        }}>
          {success.id}
        </p>
        <button
          onClick={copyToClipboard}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          📋 Copier l'identifiant
        </button>
      </div>

      <div style={{
        backgroundColor: '#fff3cd',
        color: '#856404',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '13px',
        marginBottom: '20px',
        border: '1px solid #ffc107'
      }}>
        <strong>⚠️ IMPORTANT :</strong><br/>
        Vous aurez besoin de cet identifiant pour vous connecter.<br/>
        Notez-le ou copiez-le avant de continuer !
      </div>
    </div>

    <button
      onClick={() => navigate('/login')}
      style={{
        width: '100%',
        padding: '14px',
        backgroundColor: '#4a73d9',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.3s'
      }}
    >
      J'ai noté mon identifiant → Se connecter
    </button>
  </div>

        ) : (
          <form onSubmit={handleSubmit}>
            {/* Type de compte */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#333',
                fontWeight: 'bold'
              }}>
                Type de compte *
              </label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                disabled={loading}
              >
                <option value="aidesoignant">Aide-soignant</option>
                <option value="medecin">Médecin</option>
              </select>
            </div>

            {/* Nom */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#333',
                fontWeight: 'bold'
              }}>
                Nom de famille *
              </label>
              <input
                type="text"
                name="nomFamille"
                value={formData.nomFamille}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                disabled={loading}
              />
            </div>

            {/* Prénom */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#333',
                fontWeight: 'bold'
              }}>
                Prénom *
              </label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                disabled={loading}
              />
            </div>

            {/* Date de naissance */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#333',
                fontWeight: 'bold'
              }}>
                Date de naissance
              </label>
              <input
                type="date"
                name="date_naissance"
                value={formData.date_naissance}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                disabled={loading}
              />
            </div>

            {/* Sexe */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#333',
                fontWeight: 'bold'
              }}>
                Sexe
              </label>
              <select
                name="sexe"
                value={formData.sexe}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                disabled={loading}
              >
                <option value="">Non spécifié</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>

            {/* Adresse postale */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#333',
                fontWeight: 'bold'
              }}>
                Adresse postale
              </label>
              <input
                type="text"
                name="adresse_postale"
                value={formData.adresse_postale}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#333',
                fontWeight: 'bold'
              }}>
                Adresse électronique
              </label>
              <input
                type="email"
                name="adresse_electronique"
                value={formData.adresse_electronique}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                disabled={loading}
              />
            </div>

            {/* Mot de passe */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#333',
                fontWeight: 'bold'
              }}>
                Mot de passe *
              </label>
              <input
                type="password"
                name="mot_de_passe"
                value={formData.mot_de_passe}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="Minimum 6 caractères"
                disabled={loading}
              />
            </div>

            {/* Confirmation mot de passe */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#333',
                fontWeight: 'bold'
              }}>
                Confirmer le mot de passe *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
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
                backgroundColor: loading ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '15px'
              }}
            >
              {loading ? 'Création en cours...' : 'Créer mon compte'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <Link to="/login" style={{ color: '#4a73d9', textDecoration: 'none' }}>
                ← Retour à la connexion
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignupPage;