const mongoose = require("mongoose");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Por favor, defina a variável MONGODB_URI no .env");
}

let connection = null;

async function connectToDatabase() {
  if (connection) return connection;

  try {
    connection = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Conectado no MongoDb");
    return connection;
  } catch (error) {
    console.error("Erro ao conectar no MongoDB:", error);
    throw error;
  }
}

module.exports = { connectToDatabase}