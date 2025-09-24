/**
 * Script d'initialisation de la base de données
 * Ce script peut être utilisé pour initialiser ou réinitialiser la base de données
 */

const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'games.db');

console.log('🗄️  Initialisation de la base de données...');

// Supprimer la base de données existante si elle existe
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('✅ Ancienne base de données supprimée');
}

console.log('✅ Base de données initialisée');
console.log('📍 Chemin:', dbPath);
console.log('🚀 Vous pouvez maintenant démarrer l\'API avec: npm run dev:back');