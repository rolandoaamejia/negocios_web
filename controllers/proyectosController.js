// Importar los modelos necesarios
const Proyecto = require("../models/Proyecto");
const Tareas = require("../models/Tarea");
// Importar Moment.js
const moment = require("moment");
moment.locale("es");
// Importar Sequelize y los operadores de búsqueda
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

// Muestra todos los proyectos del usuario
exports.formularioNuevoProyecto = (req, res, next) => {
  res.render("crear_proyecto");
};

// Permite la creación de un nuevo proyecto
// La conexión para almacenar en la base de datos es asíncrona (async / await)
exports.nuevoProyecto = async (req, res, next) => {
  // Obtener el usuario actual
  const usuario = res.locals.usuario;

  // Validar que el input del formulario tenga valor
  // Para acceder a los valores y asignarlos en un solo paso
  // vamos a utilizar destructuring.
  const { nombre, descripcion } = req.body;
  const mensajes = [];

  // Verificar si el nombre del proyecto tiene un valor
  if (!nombre) {
    mensajes.push({
      error: "El nombre del proyecto no puede ser vacío.",
      type: "alert-danger",
    });
  }

  if (!descripcion) {
    mensajes.push({
      error: "Debes ingresar una breve descripción del proyecto.",
      type: "alert-danger",
    });
  }

  // Si hay errores
  if (mensajes.length) {
    res.render("crear_proyecto", {
      mensajes,
    });
  } else {
    try {
      // Insertar el proyecto a la base de datos
      await Proyecto.create({ nombre, descripcion, usuarioId: usuario.id });

      mensajes.push({
        error: "Proyecto almacenado satisfactoriamente.",
        type: "alert-success",
      });

      res.redirect("/");
    } catch (error) {
      mensajes.push({
        error:
          "Ha ocurrido un error interno en el servidor. Comunicate con el personal de Taskily.",
        type: "alert-warning",
      });
    }
  }
};

// Obtener todos los proyectos
exports.proyectosHome = async (req, res, next) => {
  // Obtener el usuario actual
  const usuario = res.locals.usuario;
  const mensajes = [];

  try {
    Proyecto.findAll({
      where: {
        usuarioId: usuario.id,
      },
    }).then(function (proyectos) {
      proyectos = proyectos.map(function (proyecto) {
        proyecto.dataValues.fecha = moment(proyecto.dataValues.fecha).fromNow();
        return proyecto;
      });

      // Renderizar solo si la promesa se cumple
      res.render("home_proyecto", { proyectos });
    });
  } catch (error) {
    // Crear el mensaje de error
    mensajes.push({
      error: "Error al obtener los proyectos. Favor reintentar.",
      type: "alert-warning",
    });

    res.render("home_proyecto", mensajes);
  }
};

// Busca un proyecto por su URL
exports.obtenerProyectoPorUrl = async (req, res, next) => {
  // Obtener el usuario actual
  const usuario = res.locals.usuario;

  try {
    // Obtener el proyecto mediante la URL
    const proyecto = await Proyecto.findOne({
      where: {
        url: req.params.url,
      },
    });

    // Verificar que el proyecto pertenece al usuario
    if (proyecto.usuarioId != usuario.id) {
      res.redirect("/");
    } else {
      // Cambiar la visualización de la fecha con Moment.js
      const hace = moment(proyecto.dataValues.fecha).fromNow();

      res.render("ver_proyecto", {
        proyecto: proyecto.dataValues,
        hace,
      });
    }
  } catch (error) {
    res.redirect("/");
  }
};

// Actualizar los datos de un proyecto
exports.actualizarProyecto = async (req, res, next) => {
  // Obtener la información enviada
  const { nombre, descripcion } = req.body;

  // Obtener la información del usuario actual
  const usuario = res.locals.usuario;

  const mensajes = [];

  // Verificar si el nombre del proyecto es enviado
  if (!nombre) {
    mensajes.push({
      error: "¡El nombre del proyecto no puede ser vacío!",
      type: "alert-danger",
    });
  }

  // Verificar si la descripción del proyecto es enviada
  if (!descripcion) {
    mensajes.push({
      error: "¡La descripción del proyecto no puede ser vacía!",
      type: "alert-danger",
    });
  }

  // Si hay mensajes
  if (mensajes.length) {
    // Enviar valores correctos si la actualización falla
    const proyecto = await Proyecto.findByPk(req.params.id);

    // Cambiar la visualización de la fecha con Moment.js
    const hace = moment(proyecto.dataValues.fecha).fromNow();

    res.render("ver_proyecto", {
      proyecto: proyecto.dataValues,
      mensajes,
      hace,
    });
  } else {
    // No existen errores ni mensajes
    await Proyecto.update(
      { nombre, descripcion },
      {
        where: {
          id: req.params.id,
        },
      }
    );

    // Redirigir hacia el home de proyectos
    res.redirect("/");
  }
};

// Eliminar un proyecto
exports.eliminarProyecto = async (req, res, next) => {
  // Obtener la URL del proyecto por destructuring query
  const { url } = req.query;

  // Tratar de eliminar el proyecto
  try {
    await Proyecto.destroy({
      where: {
        url,
      },
    });

    // Si el proyecto se puede eliminar sin problemas
    // Tipos de respuesta que puede tener un servidor
    // https://developer.mozilla.org/es/docs/Web/HTTP/Status
    res.status(200).send("Proyecto eliminado correctamente");
  } catch (error) {
    // Si el proyecto no se puede eliminar
    return next();
  }
};

// Mostrar los datos y tareas del proyecto
exports.mostrarProyecto = async (req, res, next) => {
  try {
    // Obtener el proyecto desde su URL
    const proyecto = await Proyecto.findOne({
      where: {
        url: req.params.url,
      },
    });

    // Buscar las tareas del proyecto
    const tareas = await Tareas.findAll({
      where: {
        proyectoId: proyecto.id,
      },
    });

    // Convertir el objeto del modelo en un arreglo más sencillo
    // de recorrer en la vista mediante HBS
    const tareasArray = [];

    tareas.map((tarea) => {
      tareasArray.push({
        id: tarea.dataValues.id,
        definicion: tarea.dataValues.definicion,
        estado: tarea.dataValues.estado,
        fecha: tarea.dataValues.fecha,
      });
    });

    res.render("tareas", {
      proyecto: proyecto.dataValues,
      tareas: tareasArray,
    });
  } catch (error) {
    res.redirect("/");
  }
};

// Retornar los proyectos según el comodín de búsqueda
exports.buscarProyecto = async (req, res, next) => {
  // Obtener todos los proyectos que cumplan con la condición
  try {
    const { search } = req.body;

    // Op.like no distingue mayúsculas de minúsculas
    await Proyecto.findAll({
      where: {
        nombre: {
          [Op.like]: `%${search}%`,
        },
      },
    }).then(function (proyectos) {
      proyectos = proyectos.map(function (proyecto) {
        proyecto.dataValues.fecha = moment(proyecto.dataValues.fecha).fromNow();
        return proyecto;
      });

      // Renderizar solo si la promesa se cumple
      res.render("resultados", { proyectos, search });
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
};
