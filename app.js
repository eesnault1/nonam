const express = require('express')
const app = express()
const port = 3000
const axios = require('axios')
const { v4: uuidv4 } = require('uuid')
require('dotenv').config()

let jobsInProgress = {};

// Endpoint pour récupérer des infos sur une entreprise via le SIREN et envoyer les données (webhook)
app.get('/entreprise/:siren', async (req, res) => {
  const siren = req.params.siren;
  const apiKey = process.env.PAPPERS_API_KEY;
  const webhookUrl = process.env.WEBHOOK_URL
  const jobId = uuidv4(); 
  jobsInProgress[jobId] = { status: 'In Progress', data: null };
  try {
    // Appel API PAPPERS pour récupérer l'entreprise en fonction du SIREN
    const entrepriseResponse = await axios.get(`https://api.pappers.fr/v2/entreprise?api_token=${apiKey}&siren=${siren}`);
    res.json({ jobId }); 

    // Extraction des noms et prénoms des représentants et bénéficiaires
    const personnes = [...entrepriseResponse.data.representants, ...entrepriseResponse.data.beneficiaires_effectifs];
    let resultatsFinal = [];


    let personnesTraitees = new Set();
    // Boucle pour chaque personne reliée à l'entreprise
    for (const personne of personnes) {

      const identifiant = `${personne.nom} ${personne.prenom}`
      // Vérifier si la personne n'est pas en double (bénéficiaire et dirigeant)
      if (!personnesTraitees.has(identifiant)) {
        personnesTraitees.add(identifiant)
        try {
          // Recherche les entreprises liées à la personne
          const rechercheResponse = await axios.get(`https://api.pappers.fr/v2/recherche-beneficiaires?api_token=${apiKey}&q=${identifiant}`)
          console.log(`https://api.pappers.fr/v2/recherche-beneficiaires?api_token=${apiKey}&q=${identifiant}`)
          // Formatage des résultats
          resultatsFinal.push({ nom: personne.nom, prenom: personne.prenom, entreprisesAssociees: rechercheResponse.data.resultats })
        } catch (error) {
          console.error("Erreur lors de la requête pour une personne", error)
        }      
      }
    
    }

    // Envoi des résultats finaux au webhook
    axios.post(webhookUrl, resultatsFinal)
    .then(response => {
      console.log('Données envoyées au webhook avec succès');
    })
    .catch(error => {
      console.error(`Erreur lors de l'envoi des données au webhook`, error);
    });

  } catch (error) {
    res.status(500).send("Erreur lors de l'appel à l'API Pappers")
  }
})


// Endpoint pour consulter les jobs en cours
app.get('/jobs', (req, res) => {
  res.json(jobsInProgress);
});




app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
