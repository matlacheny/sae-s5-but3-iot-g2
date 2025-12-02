import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import SearchBar from '../components/common/SearchBar';
import apiService from '../services/api';
import '../styles/list.css';

const MedecinListPage = () => {
  const navigate = useNavigate();
  const idMedecin = "med1"; // À remplacer par le médecin connecté

  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [searchTerm, patients]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPatients({ 
        fk_medecin_traitant: idMedecin 
      });
      setPatients(data);
      setFilteredPatients(data);
    } catch (error) {
      console.error("Erreur chargement patients:", error);
      alert("Erreur lors du chargement des patients");
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    if (!searchTerm) {
      setFilteredPatients(patients);
      return;
    }

    const search = searchTerm.toLowerCase();
    const filtered = patients.filter(p =>
      p.prenom.toLowerCase().includes(search) ||
      p.nomFamille.toLowerCase().includes(search)
    );
    setFilteredPatients(filtered);
  };

  const handleAssign = async (patient) => {
    if (patient.fk_medecin_traitant === idMedecin) {
      // Désassigner
      const confirm = window.confirm(
        `Voulez-vous vraiment ne plus être assigné à ce patient ?\n\n(Vous n'aurez plus accès à ses informations)`
      );
      
      if (!confirm) return;

      try {
        await apiService.patchPatient(patient.id_patient, {
          fk_medecin_traitant: null
        });
        
        // Mise à jour locale
        const updatedPatients = patients.map(p =>
          p.id_patient === patient.id_patient
            ? { ...p, fk_medecin_traitant: null }
            : p
        );
        setPatients(updatedPatients);
        
      } catch (error) {
        console.error("Erreur désassignation:", error);
        alert("Erreur lors de la désassignation");
      }
    } else {
      // S'assigner
      try {
        await apiService.patchPatient(patient.id_patient, {
          fk_medecin_traitant: idMedecin
        });
        
        // Mise à jour locale
        const updatedPatients = patients.map(p =>
          p.id_patient === patient.id_patient
            ? { ...p, fk_medecin_traitant: idMedecin }
            : p
        );
        setPatients(updatedPatients);
        
      } catch (error) {
        console.error("Erreur assignation:", error);
        alert("Erreur lors de l'assignation");
      }
    }
  };

  const handleViewProfile = (patient) => {
    if (patient.fk_medecin_traitant !== idMedecin) {
      alert("Vous ne pouvez pas accéder à ce profil tant que vous ne vous êtes pas assigné à ce patient.");
      return;
    }
    navigate(`/medecin/profile?id=${patient.id_patient}`);
  };

  if (loading) {
    return (
      <div>
        <Header title="Espace Médecin" />
        <div className="container">
          <p style={{ textAlign: 'center', marginTop: '50px' }}>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Espace Médecin" />
      
      <div className="container">
        <h2>Liste de vos patients</h2>
        
        <SearchBar 
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Rechercher un patient..."
        />
        
        <div className="patient-list">
          {filteredPatients.map(patient => (
            <div 
              key={patient.id_patient}
              className={`patient-item ${
                patient.fk_medecin_traitant === idMedecin ? 'selected-patient' : ''
              }`}
            >
              <button
                className="assign-btn"
                onClick={() => handleAssign(patient)}
              >
                {patient.fk_medecin_traitant === idMedecin ? 'Assigné' : 'S\'assigner'}
              </button>
              
              <span className="patient-name">
                {patient.prenom} {patient.nomFamille}
              </span>
              
              <button
                className="profile-btn"
                onClick={() => handleViewProfile(patient)}
              >
                Afficher profil
              </button>
            </div>
          ))}
          
          {filteredPatients.length === 0 && (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              Aucun patient trouvé
            </p>
          )}
        </div>

        {filteredPatients.length > 0 && (
          <div id="legend" style={{ marginTop: '15px', textAlign: 'center' }}>
            <span style={{
              width: '15px',
              height: '15px',
              background: '#cfe3ff',
              display: 'inline-block',
              borderRadius: '4px'
            }}></span>
            <span style={{ marginLeft: '8px' }}>Vos patients</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedecinListPage;