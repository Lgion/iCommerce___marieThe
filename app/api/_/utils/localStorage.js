// Utilitaire localStorage côté serveur (Node.js)
// Stocke les données dans un fichier JSON par modèle, fallback possible
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../../_data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function getFilePath(model) {
  return path.join(DATA_DIR, `${model}.json`);
}

function readData(model) {
  const file = getFilePath(model);
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return [];
  }
}

function writeData(model, data) {
  const file = getFilePath(model);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = (model) => ({
  getAll: async () => readData(model),
  getById: async (id) => readData(model).find((item) => item.id == id),
  create: async (obj) => {
    const data = readData(model);
    const id = Date.now().toString();
    const item = { ...obj, id };
    data.push(item);
    writeData(model, data);
    return item;
  },
  update: async (id, newObj) => {
    const data = readData(model);
    const idx = data.findIndex((item) => item.id == id);
    if (idx === -1) return null;
    data[idx] = { ...data[idx], ...newObj };
    writeData(model, data);
    return data[idx];
  },
  remove: async (id) => {
    const data = readData(model);
    const idx = data.findIndex((item) => item.id == id);
    if (idx === -1) return false;
    data.splice(idx, 1);
    writeData(model, data);
    return true;
  },
});
