// Importar express router
const express = require("express");
const routes = express.Router();

// Importar expresss-validator
// https://express-validator.github.io/docs/sanitization.html
const { body } = require("express-validator");

// Importar los controladores
const proyectosController = require("../controllers/proyectosController");
const usuariosController = require("../controllers/usuariosController");
const authController = require("../controllers/authController");
const tareasController = require("../controllers/tareasController");

// Construir las rutas disponibles para el servidor
// Las rutas deben exportarse para poder ser utilizadas en otros archivos
module.exports = function () {
  // Documentación sobre los distintos verbos HTTP
  // https://developer.mozilla.org/es/docs/Web/HTTP/Methods

  // Rutas para proyectos
  routes.get(
    "/",
    authController.usuarioAutenticado,
    proyectosController.proyectosHome
  );

  routes.post(
    "/nuevo_proyecto",
    authController.usuarioAutenticado,
    // Sanitizar el contenido del formulario
    body("nombre").notEmpty().trim().escape(),
    body("descripcion").notEmpty().trim().escape(),
    proyectosController.nuevoProyecto
  );

  routes.get(
    "/nuevo_proyecto",
    authController.usuarioAutenticado,
    proyectosController.formularioNuevoProyecto
  );

  routes.get(
    "/actualizar_proyecto/:url",
    authController.usuarioAutenticado,
    proyectosController.obtenerProyectoPorUrl
  );

  routes.post(
    "/actualizar_proyecto/:id",
    authController.usuarioAutenticado,
    // Sanitizar el contenido del formulario
    body("nombre").notEmpty().trim().escape(),
    body("descripcion").notEmpty().trim().escape(),
    proyectosController.actualizarProyecto
  );

  routes.delete(
    "/proyecto/:url",
    authController.usuarioAutenticado,
    proyectosController.eliminarProyecto
  );

  routes.get(
    "/proyecto/:url",
    authController.usuarioAutenticado,
    proyectosController.mostrarProyecto
  );

  routes.post(
    "/buscar_proyectos",
    authController.usuarioAutenticado,
    // Sanitizar el contenido del formulario
    body("search").notEmpty().trim().escape(),
    proyectosController.buscarProyecto
  );

  // Rutas para autenticación
  routes.get("/registrate", usuariosController.formularioCrearCuenta);

  routes.post(
    "/registrate",
    // Sanitizar el contenido del formulario
    body("fullname").notEmpty().trim().escape(),
    usuariosController.crearCuenta
  );

  routes.get("/iniciar_sesion", usuariosController.formularioIniciarSesion);

  routes.post(
    "/iniciar_sesion",
    // Sanitizar el contenido del formulario
    body("email").notEmpty().trim(),
    body("password").notEmpty().trim(),
    authController.autenticarUsuario
  );

  routes.get("/cerrar_sesion", authController.cerrarSesion);

  // Rutas para tareas
  routes.post(
    "/proyecto/:url",
    // Sanitizar el contenido del formulario
    // TODO: revisar el envío de contenido vacío
    body("definicion").trim().notEmpty().escape(),
    authController.usuarioAutenticado,
    tareasController.agregarTarea
  );

  routes.patch(
    "/tarea/:id",
    authController.usuarioAutenticado,
    tareasController.actualizarEstadoTarea
  );

  routes.delete(
    "/tarea/:id",
    authController.usuarioAutenticado,
    tareasController.eliminarTarea
  );

  // Reestablecer la contraseña de un usuario
  routes.get(
    "/restablecer_password",
    usuariosController.formularioRestablecerPassword
  );

  routes.post("/restablecer_password", authController.enviarToken);

  routes.get("/resetear_password/:token", authController.validarToken);

  routes.post(
    "/resetear_password/:token",
    // Sanitizar el contenido del formulario
    body("password").notEmpty().trim(),
    authController.actualizarPassword
  );

  return routes;
};
