// Importar express router
const express = require("express");
const routes = express.Router();

// Importar los controladores
const principalController = require("../controllers/principalController");

module.exports = function () {
  routes.get("/", principalController.inicio);

  return routes;
};
