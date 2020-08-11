const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const routes = require("./routes");
const path = require("path");
require("dotenv").config({ path: "variables.env" });

const app = express();

app.use(express.static("public"));
app.set("views", path.join(__dirname, "views"));
app.engine(
  "hbs",
  exphbs({
    defaultLayout: "main",
    layoutsDir: path.join(app.get("views"), "layouts"),
    extname: ".hbs",
  })
);

app.set("view engine", "hbs");

// Habilitar bodyParser para leer los datos enviados por POST
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", routes());

const port = process.env.PORT || 7000;
const host = "0.0.0.0";

// Inicializar el servidor en un puerto en específico
app.listen(port, host, () => {
  console.log("Servidor ejecutandose en el puerto 7000");
});
