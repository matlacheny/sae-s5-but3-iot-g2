import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import '../styles/assign.css';

const AssignAideSoignantPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const idPatient = searchParams.get('idPatient') || 'pat1';
  
  const [aidesSoignants, setAidesSoignants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAidesSoignants();
  }, []);

  const loadAidesSoignants = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllAidesSoignants();
      setAidesSoignants(data);
    } catch (err) {
      console.error("Erreur chargement AS:", err);
      setError("Impossible de charger la liste des aides-soignants");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (aideSoignant) => {
    const confirm = window.confirm(
      `Confirmer l'assignation de ${aideSoignant.prenom} ${aideSoignant.nomFamille} au patient ?`
    );

    if (!confirm) return;

    try {
      // Récupérer les données complètes du patient
      const patientData = await apiService.getPatient(idPatient);
      
      // Mettre à jour l'aide-soignant
      patientData.fk_aide_soignant = aideSoignant.id_aide_soignant;
      
      await apiService.updatePatient(idPatient, patientData);
      
      alert("Aide-soignant assigné avec succès !");
      navigate(`/patient?idPatient=${idPatient}`);
      
    } catch (err) {
      console.error("Erreur assignation:", err);
      alert("Erreur lors de l'assignation : " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="assign-container">
        <h1>Choisir un Aide-Soignant</h1>
        <p className="loading">Chargement des aides-soignants...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="assign-container">
        <h1>Choisir un Aide-Soignant</h1>
        <p className="error">{error}</p>
        <button 
          className="btn-back"
          onClick={() => navigate(-1)}
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="assign-container">
      <h1>Choisir un Aide-Soignant</h1>
      
      <p className="patient-info">
        Patient concerné : <strong>{idPatient}</strong>
      </p>

      <div className="as-list">
        {aidesSoignants.length === 0 ? (
          <p className="loading">Aucun aide-soignant disponible</p>
        ) : (
          aidesSoignants.map(as => (
            <div key={as.id_aide_soignant} className="as-card">
              <div className="as-info">
                <span className="as-name">
                  {as.nomFamille || 'Inconnu'} {as.prenom || ''}
                </span>
                <span className="as-detail">
                  📧 {as.adresse_electronique || 'Email non renseigné'}
                </span>
                <span className="as-detail">
                  📍 {as.adresse_postale || 'Adresse non renseignée'}
                </span>
              </div>
              
              <button
                className="btn-choose"
                onClick={() => handleAssign(as)}
              >
                Choisir
              </button>
            </div>
          ))
        )}
      </div>

      <button 
        className="btn-back"
        onClick={() => navigate(-1)}
      >
        ← Retour
      </button>
    </div>
  );
};

export default AssignAideSoignantPage;