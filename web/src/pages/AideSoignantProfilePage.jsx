import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import LogoutButton from '../LogoutButton.jsx';
import AlertsPanel from '../components/AlertsPanel';
import SERVER_CONFIG from '../config/serverConfig';

const API_KEY = SERVER_CONFIG.API_KEY;
const API_URL_BASE = "https://apidatabasesae-aee3egcmdke2b6a2.germanywestcentral-01.azurewebsites.net/api";

const AideSoignantProfilePage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  const idPatient = searchParams.get("id");

  const [patient, setPatient] = useState(null);
  const [medecin, setMedecin] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // État pour la configuration de la boîte
  const [compartiments, setCompartiments] = useState([
    { num: 1, medicament: '', heure: '', quantite: '' },
    { num: 2, medicament: '', heure: '', quantite: '' },
    { num: 3, medicament: '', heure: '', quantite: '' },
    { num: 4, medicament: '', heure: '', quantite: '' },
    { num: 5, medicament: '', heure: '', quantite: '' },
    { num: 6, medicament: '', heure: '', quantite: '' }
  ]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    console.log('=== DEBUG AideSoignantProfilePage ===');
    console.log('User connecté:', user);
    console.log('ID Patient depuis URL:', idPatient);
    
    if (idPatient) {
      chargerInfos();
      chargerConfiguration();
    } else {
      setError('Aucun patient sélectionné');
      setLoading(false);
    }
  }, [idPatient]);

  // Charger la configuration sauvegardée depuis localStorage
  const chargerConfiguration = () => {
    const configKey = `medibox_config_patient_${idPatient}`;
    const savedConfig = localStorage.getItem(configKey);
    
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setCompartiments(config);
        setIsSaved(true);
        setIsEditing(false);
        console.log('Configuration chargée:', config);
      } catch (e) {
        console.error('Erreur lors du chargement de la configuration:', e);
      }
    } else {
      setIsEditing(true); // Mode édition par défaut si pas de config
    }
  };

  const chargerInfos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Chargement du patient:', idPatient);
      const repPatient = await fetch(`${API_URL_BASE}/patients/${idPatient}`, {
        headers: { "api_key": API_KEY }
      });

      if (!repPatient.ok) {
        throw new Error(`Patient introuvable (HTTP ${repPatient.status})`);
      }
      
      const patientData = await repPatient.json();
      console.log('Patient chargé:', patientData);
      setPatient(patientData);

      if (patientData.fk_medecin_traitant) {
        console.log('Chargement médecin:', patientData.fk_medecin_traitant);
        const repMed = await fetch(`${API_URL_BASE}/medecins/${patientData.fk_medecin_traitant}`, {
          headers: { "api_key": API_KEY }
        });
        
        if (repMed.ok) {
          const med = await repMed.json();
          console.log('Médecin chargé:', med);
          setMedecin(med);
        } else {
          console.warn('Médecin non trouvé');
          setMedecin({ nomFamille: "Non trouvé" });
        }
      } else {
        setMedecin({ nomFamille: "Aucun médecin" });
      }
      
      setLoading(false);
    } catch (err) {
      console.error('ERREUR chargement:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Gérer les changements dans les champs de compartiment
  const handleCompartimentChange = (index, field, value) => {
    const newCompartiments = [...compartiments];
    newCompartiments[index][field] = value;
    setCompartiments(newCompartiments);
  };

  // Enregistrer la configuration
  const handleEnregistrer = () => {
    const configKey = `medibox_config_patient_${idPatient}`;
    
    try {
      localStorage.setItem(configKey, JSON.stringify(compartiments));
      setIsSaved(true);
      setIsEditing(false);
      setSaveMessage('✓ Configuration enregistrée avec succès !');
      
      console.log('Configuration enregistrée:', compartiments);
      
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    } catch (e) {
      console.error('Erreur lors de l\'enregistrement:', e);
      setSaveMessage('✗ Erreur lors de l\'enregistrement');
      
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    }
  };

  // Passer en mode modification
  const handleModifier = () => {
    setIsEditing(true);
    setIsSaved(false);
    setSaveMessage('');
  };

  // Annuler les modifications
  const handleAnnuler = () => {
    chargerConfiguration(); // Recharger la dernière config sauvegardée
    setIsEditing(false);
    setSaveMessage('');
  };

  const renderCalendar = (m, y) => {
    const current = new Date(y, m, 1);
    const monthName = current.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    let offset = firstDay === 0 ? 6 : firstDay - 1;
    return { monthName, weekDays, offset, daysInMonth };
  };

  const changeMonth = (step) => {
    let m = month + step;
    let y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setShowDetails(false);
    setMonth(m);
    setYear(y);
  };

  const openDetails = (day, month, year) => {
    setSelectedDate(`${day}/${month + 1}/${year}`);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <div style={{ 
        fontFamily: 'Arial, sans-serif', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f8f8f8'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Chargement du profil patient...</h2>
          <p>Patient ID: {idPatient || 'Non spécifié'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        fontFamily: 'Arial, sans-serif', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f8f8f8'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          maxWidth: '500px'
        }}>
          <h2 style={{ color: '#dc3545' }}>⚠️ Erreur</h2>
          <p>{error}</p>
          <button
            onClick={() => window.history.back()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#4a73d9',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const { monthName, weekDays, offset, daysInMonth } = renderCalendar(month, year);

  const mockMedications = [
    { nom: "Doliprane", heure: "08:00", quantite: 1, compartiment: 2 },
    { nom: "Ibuprofène", heure: "14:00", quantite: 1, compartiment: 1 }
  ];

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0, backgroundColor: '#f8f8f8' }}>
      <style>{`
        body { margin: 0; padding: 0; }
        
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background-color: #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        header h1 {
          margin: 0;
          font-size: 22px;
          color: #2b4c7e;
        }
        header img {
          height: 50px;
        }
        .container {
          padding: 20px;
          max-width: 90%;
        }
        .infos {
          display: flex;
          gap: 30px;
          margin-bottom: 30px;
          max-width: 80%;
        }
        .bloc-info {
          max-width: 40%;
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .bloc-info h2 {
          margin-top: 0;
          color: #1e3d59;
        }
        h2.section-title {
          margin-top: 40px;
          color: #1e3d59;
          max-width : 90%;
        }
        .pdf-viewer {
          width: 100%;
          height: 400px;
          border: 1px solid #ccc;
          border-radius: 8px;
          margin-bottom: 40px;
        }
        .calendar {
          background-color: white;
          padding: 20px;
          max-width: 80%;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .details-panel {
          width: 360px;
          background: #ffffff;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          min-height: 200px;
        }
        .details-panel h3 {
          margin-top: 0;
          color: #1e3d59;
          font-size: 18px;
        }
        .medoc-item {
          background: #f2f6ff;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 10px;
          border-left: 4px solid #4a73d9;
        }
        .os-calendar {
          background: #fff;
          padding: 20px;
          max-width: 100%;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          width: 350px;
        }
        .cal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          font-size: 18px;
          font-weight: bold;
        }
        .nav-btn {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
        }
        .cal-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
          text-align: center;
        }
        .day-name {
          font-weight: bold;
          color: #444;
        }
        .empty {
          height: 40px;
        }
        .day {
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          background: #f2f2f2;
          transition: 0.2s;
        }
        .day:hover {
          background: #cfe3ff;
        }
        .box-config {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          max-width: 80%;
        }
        .compartiments-row {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-bottom: 20px;
          max-width: 80%;
        }
        .compartiment {
          width: 140px;
          height: 160px;
          background-color: ${isEditing ? '#cfe3ff' : '#e8f4ff'};
          border: 2px solid ${isEditing ? '#4a73d9' : '#7ba3d9'};
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          font-weight: bold;
          font-size: 16px;
          padding: 5px;
          box-sizing: border-box;
          transition: all 0.3s;
        }
        .compartiment-title {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 6px;
          color: ${isEditing ? '#1e3d59' : '#5a7a99'};
        }
        .compartiment input {
          width: 90%;
          margin: 3px 0;
          padding: 4px;
          font-size: 12px;
          border-radius: 4px;
          border: 1px solid #999;
          box-sizing: border-box;
          background-color: ${isEditing ? 'white' : '#f5f5f5'};
          cursor: ${isEditing ? 'text' : 'not-allowed'};
        }
        .config-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 20px;
          margin-bottom: 30px;
          max-width: 90%;
        }
        .btn-enregistrer {
          background-color: #28a745;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: background 0.3s;
        }
        .btn-enregistrer:hover {
          background-color: #218838;
        }
        .btn-modifier {
          background-color: #ffc107;
          color: #333;
          border: none;
          padding: 12px 30px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: background 0.3s;
        }
        .btn-modifier:hover {
          background-color: #e0a800;
        }
        .btn-annuler {
          background-color: #dc3545;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: background 0.3s;
        }
        .btn-annuler:hover {
          background-color: #c82333;
        }
        .save-message {
          text-align: center;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-weight: bold;
          animation: fadeIn 0.3s;
        }
        .save-message.success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        .save-message.error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .config-status {
          text-align: center;
          padding: 8px;
          background-color: #e7f3ff;
          border-radius: 6px;
          margin-bottom: 15px;
          font-size: 14px;
          color: #0066cc;
        }
        .alert-title {
          color: red;
          font-weight: bold;
          margin-bottom: 10px;
          max-width: 90%;
        }
        .alert-box {
          background: #ffe6e6;
          padding: 15px;
          border-radius: 12px;
          max-width: 80%;
        }
      `}</style>

      <header>
        <img src="/image/Logo.webp" alt="Logo Medibox" />
        <h1>Espace Aide-Soignant</h1>
        <LogoutButton />
      </header>

      <div className="container">
        <div className="infos">
          <div className="bloc-info">
            <h2>Patient</h2>
            <p>Nom : {patient?.nomFamille || ''}</p>
            <p>Prénom : {patient?.prenom || ''}</p>
            <p>Date de naissance : {patient?.date_naissance || ''}</p>
            <p>Sexe : {patient?.sexe || ''}</p>
            <p>Adresse postale : {patient?.adresse_postale || ''}</p>
            <p>Adresse électronique : {patient?.adresse_electronique || ''}</p>
          </div>

          <div className="bloc-info">
            <h2>Médecin traitant</h2>
            <p>Nom : {medecin?.nomFamille || ''}</p>
            <p>Prénom : {medecin?.prenom || ''}</p>
            <p>Date de naissance : {medecin?.date_naissance || ''}</p>
            <p>Sexe : {medecin?.sexe || ''}</p>
            <p>Adresse postale : {medecin?.adresse_postale || ''}</p>
            <p>Adresse électronique : {medecin?.adresse_electronique || ''}</p>
          </div>
        </div>

        <h2 className="section-title">Prescription</h2>
        <iframe className="pdf-viewer" src=""></iframe>

        <h2 className="section-title">Suivi du traitement</h2>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div className="calendar">
            <div className="os-calendar">
              <div className="cal-header">
                <button className="nav-btn" onClick={() => changeMonth(-1)}>◀</button>
                <span className="month-title">{monthName.charAt(0).toUpperCase() + monthName.slice(1)}</span>
                <button className="nav-btn" onClick={() => changeMonth(1)}>▶</button>
              </div>
              <div className="cal-grid">
                {weekDays.map(d => <div key={d} className='day-name'>{d}</div>)}
                {[...Array(offset)].map((_, i) => <div key={`empty-${i}`} className='empty'></div>)}
                {[...Array(daysInMonth)].map((_, i) => (
                  <div
                    key={i + 1}
                    className='day'
                    onClick={() => openDetails(i + 1, month, year)}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {showDetails && (
            <aside className="details-panel">
              <h3>Détails du {selectedDate}</h3>
              <div>
                {mockMedications.map((med, index) => (
                  <div key={index} className="medoc-item">
                    <b>{med.nom}</b> – {med.heure}<br />
                    Quantité : {med.quantite}<br />
                    Compartiment : {med.compartiment}
                  </div>
                ))}
              </div>
            </aside>
          )}
        </div>

        <h2 className="section-title">Configuration de la boîte</h2>
        
        {isSaved && !isEditing && (
          <div className="config-status">
            🔒 Configuration enregistrée - Cliquez sur "Modifier" pour apporter des changements
          </div>
        )}

        {saveMessage && (
          <div className={`save-message ${saveMessage.includes('✓') ? 'success' : 'error'}`}>
            {saveMessage}
          </div>
        )}

        <div className="box-config">
          <div className="compartiments-row">
            {compartiments.slice(0, 3).map((comp, index) => (
              <div key={comp.num} className="compartiment">
                <div className="compartiment-title">Compartiment {comp.num}</div>
                <input 
                  type="text" 
                  placeholder="Nom du médicament"
                  value={comp.medicament}
                  onChange={(e) => handleCompartimentChange(index, 'medicament', e.target.value)}
                  disabled={!isEditing}
                />
                <input 
                  type="time"
                  value={comp.heure}
                  onChange={(e) => handleCompartimentChange(index, 'heure', e.target.value)}
                  disabled={!isEditing}
                />
                <input 
                  type="number" 
                  min="1" 
                  placeholder="Quantité"
                  value={comp.quantite}
                  onChange={(e) => handleCompartimentChange(index, 'quantite', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            ))}
          </div>

          <div className="compartiments-row">
            {compartiments.slice(3, 6).map((comp, index) => (
              <div key={comp.num} className="compartiment">
                <div className="compartiment-title">Compartiment {comp.num}</div>
                <input 
                  type="text" 
                  placeholder="Nom du médicament"
                  value={comp.medicament}
                  onChange={(e) => handleCompartimentChange(index + 3, 'medicament', e.target.value)}
                  disabled={!isEditing}
                />
                <input 
                  type="time"
                  value={comp.heure}
                  onChange={(e) => handleCompartimentChange(index + 3, 'heure', e.target.value)}
                  disabled={!isEditing}
                />
                <input 
                  type="number" 
                  min="1" 
                  placeholder="Quantité"
                  value={comp.quantite}
                  onChange={(e) => handleCompartimentChange(index + 3, 'quantite', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="config-buttons">
          {isEditing ? (
            <>
              <button className="btn-enregistrer" onClick={handleEnregistrer}>
                 Enregistrer
              </button>
              {isSaved && (
                <button className="btn-annuler" onClick={handleAnnuler}>
                  ✖ Annuler
                </button>
              )}
            </>
          ) : (
            <button className="btn-modifier" onClick={handleModifier}>
              ✏️ Modifier
            </button>
          )}
        </div>

        <h2 className="alert-title">Alertes</h2>
        <div className="alert-box">Aucune alerte pour le moment</div> 
      </div>

       {user && (
        <AlertsPanel 
          aideId={user.id} 
          password={user.data?.mot_de_passe} 
        />
      )}
    </div>
  );
};

export default AideSoignantProfilePage;