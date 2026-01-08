import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import LogoutButton from '../LogoutButton.jsx';
import SERVER_CONFIG from '../config/serverConfig';

const API_KEY = SERVER_CONFIG.API_KEY;
const API_URL_BASE = "https://apidatabasesae-aee3egcmdke2b6a2.germanywestcentral-01.azurewebsites.net/api";

const MedecinProfilePage = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const idPatient = searchParams.get("id");

  const [patient, setPatient] = useState(null);
  const [aideSoignant, setAideSoignant] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // États pour la gestion des prescriptions
  const [prescriptionUrl, setPrescriptionUrl] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    console.log('=== DEBUG MedecinProfilePage ===');
    console.log('User connecté:', user);
    console.log('ID Patient depuis URL:', idPatient);
    
    if (idPatient) {
      chargerInfos();
      chargerPrescription();
    } else {
      setError('Aucun patient sélectionné');
      setLoading(false);
    }
  }, [idPatient]);

  // Charger la prescription sauvegardée
  const chargerPrescription = () => {
    const prescKey = `prescription_patient_${idPatient}`;
    const savedPrescription = localStorage.getItem(prescKey);
    
    if (savedPrescription) {
      setPrescriptionUrl(savedPrescription);
      console.log('Prescription chargée pour le patient:', idPatient);
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

      if (patientData.fk_aide_soignant) {
        console.log('Chargement aide-soignant:', patientData.fk_aide_soignant);
        const repAS = await fetch(`${API_URL_BASE}/aidesoignants/${patientData.fk_aide_soignant}`, {
          headers: { "api_key": API_KEY }
        });
        
        if (repAS.ok) {
          const aide = await repAS.json();
          console.log('Aide-soignant chargé:', aide);
          setAideSoignant(aide);
        } else {
          console.warn('Aide-soignant non trouvé');
          setAideSoignant({ nomFamille: "Non trouvé" });
        }
      } else {
        setAideSoignant({ nomFamille: "Aucun aide-soignant assigné" });
      }
      
      setLoading(false);
    } catch (err) {
      console.error('ERREUR chargement:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Gérer l'ajout de prescription
  const handleAjouterPrescription = () => {
    setShowUploadModal(true);
    setUploadMessage('');
  };

  // Gérer l'upload du fichier
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Vérifier le type de fichier (PDF uniquement)
    if (file.type !== 'application/pdf') {
      setUploadMessage('❌ Erreur : Seuls les fichiers PDF sont acceptés');
      return;
    }

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadMessage('❌ Erreur : Le fichier est trop volumineux (max 10MB)');
      return;
    }

    setIsUploading(true);
    setUploadMessage('⏳ Upload en cours...');

    // Convertir le fichier en base64 pour le stocker
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const base64Data = event.target.result;
      
      // Sauvegarder dans localStorage
      const prescKey = `prescription_patient_${idPatient}`;
      localStorage.setItem(prescKey, base64Data);
      
      setPrescriptionUrl(base64Data);
      setUploadMessage('✅ Prescription ajoutée avec succès !');
      setIsUploading(false);
      
      console.log('Prescription sauvegardée pour le patient:', idPatient);
      
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadMessage('');
      }, 2000);
    };

    reader.onerror = () => {
      setUploadMessage('❌ Erreur lors de la lecture du fichier');
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  // Supprimer la prescription
  const handleSupprimerPrescription = () => {
    if (!prescriptionUrl) {
      alert('Aucune prescription à supprimer');
      return;
    }

    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette prescription ?')) {
      const prescKey = `prescription_patient_${idPatient}`;
      localStorage.removeItem(prescKey);
      setPrescriptionUrl('');
      alert('Prescription supprimée avec succès');
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
          max-width: 80%;
        }
        .pdf-viewer {
          width: 100%;
          height: 500px;
          border: 2px solid #ddd;
          border-radius: 8px;
          margin-bottom: 40px;
          background-color: #f9f9f9;
        }
        .no-prescription {
          width: 90%;
          height: 500px;
          border: 2px dashed #ccc;
          border-radius: 8px;
          margin-bottom: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #fafafa;
          color: #999;
          font-style: italic;
        }
        .BouttonAjoutPrescription {
          padding: 8px 16px;
          background-color: #4a73d9;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          margin-right: 10px;
          transition: background 0.3s;
        }
        .BouttonAjoutPrescription:hover {
          background-color: #365dbf;
        }
        .BouttonAjoutPrescription.delete {
          background-color: #dc3545;
        }
        .BouttonAjoutPrescription.delete:hover {
          background-color: #c82333;
        }
        .BouttonAjoutPrescription:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        .calendar {
          background-color: white;
          padding: 20px;
          max-width: 90%;
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
          max-width: 85%;
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
          max-width: 80%;
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

        /* Modal d'upload */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-upload {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          width: 500px;
          max-width: 90%;
        }
        .modal-upload h3 {
          margin-top: 0;
          color: #2b4c7e;
          font-size: 22px;
        }
        .upload-area {
          border: 2px dashed #4a73d9;
          border-radius: 8px;
          padding: 40px;
          text-align: center;
          background-color: #f0f8ff;
          margin: 20px 0;
          cursor: pointer;
          transition: all 0.3s;
        }
        .upload-area:hover {
          background-color: #e6f2ff;
          border-color: #365dbf;
        }
        .upload-area input[type="file"] {
          display: none;
        }
        .upload-icon {
          font-size: 48px;
          margin-bottom: 10px;
        }
        .upload-message {
          padding: 12px;
          border-radius: 6px;
          margin: 15px 0;
          font-weight: bold;
          text-align: center;
        }
        .upload-message.success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        .upload-message.error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        .upload-message.info {
          background-color: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        }
        .modal-buttons {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 20px;
        }
        .btn-modal {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.3s;
        }
        .btn-modal.cancel {
          background-color: #6c757d;
          color: white;
        }
        .btn-modal.cancel:hover {
          background-color: #5a6268;
        }
      `}</style>

      <header>
        <img src="/image/Logo.webp" alt="Logo Medibox" />
        <h1>Espace Medecin</h1>
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
            <h2>Aide-Soignant</h2>
            <p>Nom : {aideSoignant?.nomFamille || ''}</p>
            <p>Prénom : {aideSoignant?.prenom || ''}</p>
            <p>Date de naissance : {aideSoignant?.date_naissance || ''}</p>
            <p>Sexe : {aideSoignant?.sexe || ''}</p>
            <p>Adresse postale : {aideSoignant?.adresse_postale || ''}</p>
            <p>Adresse électronique : {aideSoignant?.adresse_electronique || ''}</p>
          </div>
        </div>

        <h2 className="section-title">Prescription</h2>
        <button 
          className="BouttonAjoutPrescription" 
          type="button"
          onClick={handleAjouterPrescription}
        >
          📄 {prescriptionUrl ? 'Modifier la prescription' : 'Ajouter une prescription'}
        </button>
        {prescriptionUrl && (
          <button 
            className="BouttonAjoutPrescription delete" 
            type="button"
            onClick={handleSupprimerPrescription}
          >
            🗑️ Supprimer
          </button>
        )}
        <br /><br />
        
        {prescriptionUrl ? (
          <iframe 
            className="pdf-viewer" 
            src={prescriptionUrl}
            title="Prescription PDF"
          />
        ) : (
          <div className="no-prescription">
            📋 Aucune prescription ajoutée pour ce patient
          </div>
        )}

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
      </div>

      {/* Modal d'upload */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => !isUploading && setShowUploadModal(false)}>
          <div className="modal-upload" onClick={(e) => e.stopPropagation()}>
            <h3>📄 Ajouter une prescription</h3>
            
            <label htmlFor="file-upload" className="upload-area">
              <input
                id="file-upload"
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <div className="upload-icon">📁</div>
              <p style={{ margin: '10px 0', fontSize: '16px', color: '#2b4c7e' }}>
                <strong>Cliquez pour sélectionner un fichier PDF</strong>
              </p>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                Format accepté : PDF uniquement (max 10MB)
              </p>
            </label>

            {uploadMessage && (
              <div className={`upload-message ${
                uploadMessage.includes('✅') ? 'success' : 
                uploadMessage.includes('❌') ? 'error' : 'info'
              }`}>
                {uploadMessage}
              </div>
            )}

            <div className="modal-buttons">
              <button 
                className="btn-modal cancel"
                onClick={() => setShowUploadModal(false)}
                disabled={isUploading}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedecinProfilePage;