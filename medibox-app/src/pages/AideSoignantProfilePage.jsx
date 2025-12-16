import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import LogoutButton from '../LogoutButton';

const API_KEY = "9769a0eab09284d4bfeef45e4103642cf00b1b17f15f65afeb4f336890e37e63";
const API_URL_BASE = "https://apidatabasesae-aee3egcmdke2b6a2.germanywestcentral-01.azurewebsites.net/api";

const AideSoignantProfilePage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  // CORRECTION : On récupère l'ID du patient depuis l'URL
  const idPatient = searchParams.get("id");

  const [patient, setPatient] = useState(null);
  const [medecin, setMedecin] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('=== DEBUG AideSoignantProfilePage ===');
    console.log('User connecté:', user);
    console.log('ID Patient depuis URL:', idPatient);
    
    if (idPatient) {
      chargerInfos();
    } else {
      setError('Aucun patient sélectionné');
      setLoading(false);
    }
  }, [idPatient]);

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

      // Charger le médecin si assigné
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

  // Gestion du chargement
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

  // Gestion des erreurs
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
        }
        .infos {
          display: flex;
          gap: 30px;
          margin-bottom: 30px;
        }
        .bloc-info {
          flex: 1;
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
          margin-bottom: 30px;
        }
        .compartiments-row {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-bottom: 20px;
        }
        .compartiment {
          width: 140px;
          height: 160px;
          background-color: #cfe3ff;
          border: 2px solid #4a73d9;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          font-weight: bold;
          font-size: 16px;
          padding: 5px;
          box-sizing: border-box;
        }
        .compartiment-title {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 6px;
        }
        .compartiment input {
          width: 90%;
          margin: 3px 0;
          padding: 4px;
          font-size: 12px;
          border-radius: 4px;
          border: 1px solid #999;
          box-sizing: border-box;
        }
        .alert-title {
          color: red;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .alert-box {
          background: #ffe6e6;
          padding: 15px;
          border-radius: 12px;
          min-width: 600px;
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
        <div className="box-config">
          <div className="compartiments-row">
            {[1, 2, 3].map(num => (
              <div key={num} className="compartiment">
                <div className="compartiment-title">Compartiment {num}</div>
                <input type="text" placeholder="Nom du médicament" />
                <input type="time" />
                <input type="number" min="1" placeholder="Quantité" />
              </div>
            ))}
          </div>

          <div className="compartiments-row">
            {[4, 5, 6].map(num => (
              <div key={num} className="compartiment">
                <div className="compartiment-title">Compartiment {num}</div>
                <input type="text" placeholder="Nom du médicament" />
                <input type="time" />
                <input type="number" min="1" placeholder="Quantité" />
              </div>
            ))}
          </div>
        </div>

        <h2 className="alert-title">Alertes</h2>
        <div className="alert-box">Aucune alerte pour le moment</div>
      </div>
    </div>
  );
};

export default AideSoignantProfilePage;