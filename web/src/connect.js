document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOM fully loaded and parsed"); // test pour savoir si tout est bien chargé
});

import dotenv from "dotenv";
dotenv.config();

const API_PATH = "https://apidatabasesae-aee3egcmdke2b6a2.germanywestcentral-01.azurewebsites.net";
const API_KEY = process.env.API_KEY;
// liste qui va servir à faire les fetch et les rediretions en dynamique
// ATTENTION, CA VEUT DIRE QUE LES NOMS DE FICHIERS ET DE BD DOIVENT SUIVRE UN CERTAIN FORMAT, SINON CA PLANTE
var LISTE_ROLES = ["Medecins","Patients","AideSoignants"];

var connexion = false;
async function send(){
    // récupere les données entrées
    const ID = document.getElementById('adminId').value;
    const PWD = document.getElementById('adminPwd').value;

    // vérifications champs vides
    if (!ID || !PWD) {
        alert("Veuillez remplir tous les champs");
        return;
    }

    console.log("id :", ID, "pwd :", PWD);

    // vérifications en BD
    for(let i = 0 ; i < LISTE_ROLES.length ; i++){
        console.log(i);
        const ok = await verif_infos(ID, PWD, LISTE_ROLES[i].toLowerCase());
            if (ok) {
                connexion = true;

                console.log("Connexion acceptée :", ID, PWD);
                // redirection
                window.location.href = "./src/PageProfil"+LISTE_ROLES[i]+".html"; 

                break;
            }
            console.log("connexion : "+connexion);
    }
    // message d'erreur si connexion refusée
    if(connexion == false){
        alert("Identifiant ou mot de passe invalide");
    }

}
async function verif_infos(id, pwd, table) {
    try {
        const response = await fetch(
            `${API_PATH}/api/${table}/${id}`,
            {
                method: "GET",
                headers: {
                    api_key: API_KEY,
                    "Content-Type": "application/json"
                }
            }
        )

        if (!response.ok) {
            console.log(`ID invalide dans table ${table}`);
            console.log(response);
            return false;
        }

        const infos = await response.json();

        if (pwd === infos.mot_de_passe) {
            return true;
        } else {
            console.log(`MDP invalide pour table ${table} et l utilisateur ${id}`);
            return false;
        }
    }
    catch (error) {
        console.log("Erreur fetch :", error);
        return false;
    }
}