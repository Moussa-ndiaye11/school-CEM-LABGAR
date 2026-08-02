require("express-async-errors");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const routes = require("./routes");

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "*", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api", routes);

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route introuvable." });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error(err);

  if (err.code === "P2002") {
    return res.status(409).json({ message: "Cette ressource existe deja." });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ message: "Ressource introuvable." });
  }

  res.status(err.status || 500).json({ message: err.message || "Erreur serveur." });
});

module.exports = app;
