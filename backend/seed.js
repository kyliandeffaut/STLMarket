// backend/seed.js
const mongoose = require('mongoose');

// 1. Connexion à la base de données (la même URL que dans votre .env)
mongoose.connect('mongodb://localhost:27017/stlmarket?directConnection=true')
  .then(() => console.log('✅ Connecté à MongoDB pour le seed'))
  .catch(err => console.error('Erreur connexion:', err));

// 2. Définition du modèle (Le "moule" pour vos données)
// Je reprends les champs que j'ai vus dans votre code Frontend (ProductDetail.tsx)
const FileSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  category: String,
  filename: String, // IMPORTANT : Doit correspondre exactement au nom du fichier dans public/files
  downloads: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const File = mongoose.model('File', FileSchema);

// 3. Les données à insérer
const produits = [
  {
    title: "Boîte articulée",
    description: "Une boîte pratique imprimable en une seule fois.",
    price: 5.00,
    category: "Maison",
    filename: "Boîte articulée.stl" // Attention aux majuscules/accents !
  },
  {
    title: "Support téléphone",
    description: "Support universel pour smartphone, angle réglable.",
    price: 12.50,
    category: "Bureau",
    filename: "Support téléphone.stl" // Je devine la fin du nom d'après votre image
  }
];

// 4. L'action d'insertion
const seedDB = async () => {
  try {
    // On vide d'abord la collection pour ne pas avoir de doublons
    await File.deleteMany({});
    console.log('🗑️ Anciennes données supprimées');

    // On insère les nouveaux produits
    await File.insertMany(produits);
    console.log('🌱 Base de données remplie avec succès !');
    
  } catch (error) {
    console.log('Erreur lors du seed:', error);
  } finally {
    // On coupe la connexion quand c'est fini
    mongoose.connection.close();
    console.log('Au revoir !');
  }
};

seedDB();