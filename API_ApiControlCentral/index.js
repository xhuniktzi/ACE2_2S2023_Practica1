const Hapi = require("@hapi/hapi");
const { SerialPort } = require('serialport')
const mysql = require("mysql");

require('dotenv').config()

const { ReadlineParser } = require("@serialport/parser-readline");
//Sequelize se usa para la conexion con la base de datos
const Sequelize = require("sequelize");

// -- configuracion de servidor
const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

// -- configuracion de servidor
const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USER, process.env.DATABASE_PASSWORD, {
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  dialect: "mysql",
});

// -- configuracion de serialport
const port = new SerialPort({path: process.env.SERIAL_PORT, baudRate: 9600});
const parser = new ReadlineParser({ delimiter: "\r\n" });
port.pipe(parser);

// -- leer data port
port.on("open", () => {
  console.log("serial port open");
});

parser.on("data", (data) => {
  const values = data.split(",");
  const temp = values[0];
  const humd = values[1];
  const lumen = values[2];
  const air_co2 = values[3];
  console.log("Temperature 1: ", temp);
  console.log("Humidity: ", humd);
  console.log("lumen: ", lumen);
  console.log("air: ", air_co2);

  //Temperatura
  var values_array = [[temp, getRealDate(), getRealTime()]];
  connection.query(
    "INSERT INTO temperatura (`Value`, `Date`,`Time`) VALUES ?",
    [values_array],
    function (error, results, fields) {
      if (error) throw error;
    }
  );

  //Humedad
  var values_array = [[humd, getRealDate(),  getRealTime()]];
  connection.query(
    "INSERT INTO humedad (`Value`, `Date`,`Time`) VALUES ?",
    [values_array],
    function (error, results, fields) {
      if (error) throw error;
    }
  );

  //cantidad de luz
  var values_array = [[lumen, getRealDate(), getRealTime()]];
  connection.query(
    "INSERT INTO lumen (`Value`, `Date`,`Time`) VALUES ?",
    [values_array],
    function (error, results, fields) {
      if (error) throw error;
    }
  );

  //calidad del aire
  var values_array = [[air_co2, getRealDate(), getRealTime()]];
  connection.query(
    "INSERT INTO air (`Value`, `Date`,`Time`) VALUES ?",
    [values_array],
    function (error, results, fields) {
      if (error) throw error;
    }
  );
});

parser.on("error", (err) => console.log(err));
port.on("error", (err) => console.log(err));

// Funcion para parsear las fechas
function getRealDate() {
  var date_now = new Date();
  var day_now = date_now.getDate();
  var mont_now = date_now.getMonth() + 1;
  var year_now = date_now.getFullYear();
  return `${year_now}-${mont_now}-${day_now}`;
}

// Funcion para parsear el tiempo
function getRealTime() {
  var date_now = new Date();
  var hour_now = date_now.getHours();
  var minute_now = date_now.getMinutes();
  var seconds_now = date_now.getSeconds();
  return `${hour_now}:${minute_now}:${seconds_now}`;
}

// -- conexion con la base de datos

// -- Inicio de configuración del host

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: "0.0.0.0",
    routes: {
      cors: true,
    },
  });

  // ---- Rutas de peticion y envio
  server.route({
    method: "GET",
    path: "/",
    handler: (request, h) => {
      // Prueba de conexion a sql
      connection.connect(function (err) {
        if (err) {
          console.error("error connecting: " + err.stack);
          return;
        }

        console.log("connected as id " + connection.threadId);
      });

      return "Conexion con exito";
    },
  });

  //------------------------RUTAS TIEMPO REAL------------------------

  // ---------  TEMPERATURA DEL AMBIENTE
  server.route({
    method: "GET",
    path: "/temperatura_get",
    handler: async (request, h) => {
      const res = await getLastTemperature();
      return res;
    },
  });

  // ---------  HUMEDAD DEL AMBIENTE
  server.route({
    method: "GET",
    path: "/humedad_get",
    handler: async (request, h) => {
      const res = await getLastHumidity();
      return res;
    },
  });

  // ---------  CANTIDAD DE LUZ
  server.route({
    method: "GET",
    path: "/lumen_get",
    handler: async (request, h) => {
      const res = await getLastLumen();
      return res;
    },
  });

  // ---------  CALIDAD DEL AIRE
  server.route({
    method: "GET",
    path: "/air_get",
    handler: async (request, h) => {
      const res = await getLastAirCo2();
      return res;
    },
  });

  //------------------------RUTAS DEL HISTORIAL------------------------

  //  ----------------- TEMPERATURA DEL AMBIENTE

  server.route({
    method: "POST",
    path: "/temperatura_getHistorial",
    handler: async (request, h) => {
      var startDate = request.payload.startDate;
      var endDate = request.payload.endDate;
      //Estas son las procedures en base de datos que se encargan de hacer la consulta (getHistorialTemperature)
      const res = await getHistorialTemperature(startDate, endDate);
      return res;
    },
  });

  // ---------------- HUMEDAD DEL AMBIENTE

  server.route({
    method: "POST",
    path: "/humedad_getHistorial",
    handler: async (request, h) => {
      var startDate = request.payload.startDate;
      var endDate = request.payload.endDate;
      const res = await getHistorialHumRelative(startDate, endDate);
      return res;
    },
  });

  // ---------------- CANTIDAD DE LUZ

  server.route({
    method: "POST",
    path: "/lumen_getHistorial",
    handler: async (request, h) => {
      var startDate = request.payload.startDate;
      var endDate = request.payload.endDate;
      const res = await getHistorialLumen(startDate, endDate);
      return res;
    },
  });

  // ---------------- CALIDAD DEL AIRE

  server.route({
    method: "POST",
    path: "/air_co2_getHistorial",
    handler: async (request, h) => {
      var startDate = request.payload.startDate;
      var endDate = request.payload.endDate;
      const res = await getHistorialAirCo2(startDate, endDate);
      return res;
    },
  });

  // -- Aviso de funcionamiento de la API
  await server.start();
  console.log("Servidor Funcionando en %s", server.info.uri);
};

// ************************ Espacio Funciones querys de las peticiones en tiempo real ****

//temperatura
async function getLastTemperature() {
  try {
    await sequelize.authenticate();
    console.log("Connected");
    const [results, metadata] = await sequelize.query(
      "SELECT * FROM `temperatura` tx ORDER BY `Date` DESC, `Time` DESC LIMIT 1;"
    );
    return results;
  } catch (err) {
    console.log("Error connect to db");
  }
}

//humedad
async function getLastHumidity() {
  try {
    await sequelize.authenticate();
    console.log("Connected");
    const [results, metadata] = await sequelize.query(
      "SELECT * FROM `humedad` hr ORDER BY `Date` DESC, `Time` DESC LIMIT 1;"
    );
    return results;
  } catch (err) {
    console.log("Error connect to db");
  }
}

//lumnen
async function getLastLumen() {
  try {
    await sequelize.authenticate();
    console.log("Connected");
    const [results, metadata] = await sequelize.query(
      "SELECT * FROM `lumen` lm ORDER BY `Date` DESC, `Time` DESC LIMIT 1;"
    );
    return results;
  } catch (err) {
    console.log("Error connect to db");
  }
}

//air co2
async function getLastAirCo2() {
  try {
    await sequelize.authenticate();
    console.log("Connected");
    const [results, metadata] = await sequelize.query(
      "SELECT * FROM `air` ar ORDER BY `Date` DESC, `Time` DESC LIMIT 1;"
    );
    return results;
  } catch (err) {
    console.log("Error connect to db");
  }
}

// ************************ Espacio para funciones querys del historial ****************

//TODO: Hacer las funciones de las querys para el historial, pero estan en espera....
async function getHistorialTemperature(str_Start, str_End) {
  try {
    console.log("--------------")
    console.log(typeof str_Start, str_Start, typeof str_End, str_End)
    await sequelize.authenticate();
    console.log("Connected");
    const [results, metadata] = await sequelize.query(
      "select * from temperatura where Date >= '" + str_Start + "' and Date <= '" + str_End + "' order by Date asc;"
    );
    return results;
  } catch (err) {
    console.log("Error connect to db");
  }
}

async function getHistorialHumRelative(str_Start, str_End) {
  try {
    console.log("--------------")
    console.log(typeof str_Start, str_Start, typeof str_End, str_End)
    await sequelize.authenticate();
    console.log("Connected");
    const [results, metadata] = await sequelize.query(
      "select * from humedad where Date >= '" + str_Start + "' and Date <= '" + str_End + "' order by Date asc;"
    );
    return results;
  } catch (err) {
    console.log("Error connect to db");
  }
}

async function getHistorialLumen(str_Start, str_End) {
  try {
    console.log("--------------")
    console.log(typeof str_Start, str_Start, typeof str_End, str_End)
    await sequelize.authenticate();
    console.log("Connected");
    const [results, metadata] = await sequelize.query(
      "select * from lumen where Date >= '" + str_Start + "' and Date <= '" + str_End + "' order by Date asc;"
    );
    return results;
  } catch (err) {
    console.log("Error connect to db");
  }
}

async function getHistorialAirCo2(str_Start, str_End) {
  try {
    console.log("--------------")
    console.log(typeof str_Start, str_Start, typeof str_End, str_End)
    await sequelize.authenticate();
    console.log("Connected");
    const [results, metadata] = await sequelize.query(
      "select * from air where Date >= '" + str_Start + "' and Date <= '" + str_End + "' order by Date asc;"
    );
    return results;
  } catch (err) {
    console.log("Error connect to db");
  }
}

// -- Proceso de errores

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

// -- Metodo de inicialización

init();
