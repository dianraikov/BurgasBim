const {
  PG_USER,
  PG_HOST,
  PG_DATABASE,
  PG_PASSWORD,
  PG_PORT,
} = require("../../config.js");
const Pool = require("pg").Pool;
const pool = new Pool({
  host: PG_HOST,
  database: PG_DATABASE,
  user: PG_USER,
  password: PG_PASSWORD,
  port: PG_PORT,
});

const postgres = {
  getDataRooms: (request, response) => {
    const room_code_pg = request.query.room_code;
    statement =
      'SELECT public."2-Room Type".* FROM public."2-Room Type" JOIN public."1-BIM&Rooms Relation" ON public."2-Room Type"."SOA_KEY" = "1-BIM&Rooms Relation"."SOA_KEY_REVIT" WHERE "1-BIM&Rooms Relation"."NUMERO_HABITACION" =' +
      "'" +
      room_code_pg +
      "'";
    pool.query(statement, (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    });
  },
  getDataEquipment: (request, response) => {
    const room_code_pg = request.query.room_code;
    statement =
      'SELECT *  FROM public."5- List of Equipment of each room" WHERE "NUMERO_HABITACION"=' +
      "'" +
      room_code_pg +
      "'";
    pool.query(statement, (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    });
  },
  getColumnsEquipment: async (request, response) => {
    statement =
      "SELECT column_name FROM information_schema.columns WHERE table_name = '5- List of Equipment of each room'";
    pool.query(statement, (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    });
  },
  getColumnsRoom: async (request, response) => {
    statement =
      "SELECT column_name FROM information_schema.columns WHERE table_name = '2-Room Type'";
    pool.query(statement, (error, results) => {
      if (error) {
        throw error;
      }

      response.status(200).json(results.rows);
    });
  },
  updateDataEquipment: async (req, res) => {
    try {
      const { columna, valor, num_hab, id_equip } = req.body;
      const query =
        'UPDATE public."5- List of Equipment of each room" SET ' +
        '"' +
        columna +
        '"' +
        "= '" +
        valor +
        "'" +
        ' WHERE "NUMERO_HABITACION" =' +
        "'" +
        num_hab +
        "'" +
        ' AND "ID_EQUIP" =' +
        "'" +
        id_equip +
        "'";
      const result = await pool.query(query);
      // Verifica si se actualizó correctamente
      if (result.rowCount === 1) {
        console.log(
          "The equipment " +
            id_equip +
            " was updated in the column " +
            columna +
            " with the value " +
            valor +
            " in the room " +
            num_hab
        );
        res.send("Datos actualizados correctamente.");
      } else {
        res.send("No se pudo actualizar la bbdd.");
      }
    } catch (error) {
      console.error("Error al actualizar la bbdd:", error);
      res.status(500).send("Error interno del servidor");
    }
  },
  updateDataRoom: async (req, res) => {
    try {
      const { columna, valor, num_hab } = req.body;
      const query =
        'UPDATE public."2-Room Type" SET ' +
        '"' +
        columna +
        '"' +
        " = " +
        "'" +
        valor +
        "'" +
        ' WHERE "SOA_KEY" IN (SELECT "2-Room Type"."SOA_KEY" FROM public."2-Room Type" JOIN public."1-BIM&Rooms Relation" ON public."2-Room Type"."SOA_KEY" = "1-BIM&Rooms Relation"."SOA_KEY_REVIT" WHERE "1-BIM&Rooms Relation"."NUMERO_HABITACION" =' +
        "'" +
        num_hab +
        "')";
      const result = await pool.query(query);
      // Verifica si se actualizó correctamente
      if (result.rowCount === 1) {
        res.send("Datos actualizados correctamente.");
      } else {
        res.send("No se pudo actualizar la bbdd.");
      }
    } catch (error) {
      console.error("Error al actualizar la bbdd:", error);
      res.status(500).send("Error interno del servidor");
    }
  },
  addColumnRoom: async (req, res) => {
    try {
      const { valor } = req.body;
      const valorLimpio = cleanString(valor)
      const query =
        'ALTER TABLE public."2-Room Type" ADD COLUMN ' +
        valorLimpio +
        " character varying(255);";
      // Ejecutar la consulta SQL
      pool.query(query, (error, resultados) => {
        if (error) {
          console.error("Error al añadir la columna:", error);
          res.status(500).json({ mensaje: "Error al eliminar la columna" });
        } else {
          console.log("Columna añadida con éxito.");
          res.json({ mensaje: "Columna añadida con éxito" });
        }
      });
    } catch (error) {
      console.error("Error al actualizar la bbdd:", error);
      res.status(500).send("Error interno del servidor");
    }
  },
  addColumnEquipment: async (req, res) => {
    try {
      const { valor } = req.body;
      const valorLimpio = cleanString(valor)
      const query =
        'ALTER TABLE public."5- List of Equipment of each room" ADD COLUMN ' +
        valorLimpio +
        " character varying(255)";
      // Ejecutar la consulta SQL
      pool.query(query, (error, resultados) => {
        if (error) {
          console.error("Error al añadir la columna:", error);
          res.status(500).json({ mensaje: "Error al eliminar la columna" });
        } else {
          console.log("Columna añadida con éxito.");
          res.json({ mensaje: "Columna añadida con éxito" });
        }
      });
    } catch (error) {
      console.error("Error al actualizar la bbdd:", error);
      res.status(500).send("Error interno del servidor");
    }
  },
  deleteColumnRoom: async (req, res) => {
    try {
      const { columna } = req.body;
      const query =
        'ALTER TABLE public."2-Room Type" DROP COLUMN IF EXISTS' +
        '"' +
        columna +
        '"';
      // Ejecutar la consulta SQL
      pool.query(query, (error, resultados) => {
        if (error) {
          console.error("Error al eliminar la columna:", error);
          res.status(500).json({ mensaje: "Error al eliminar la columna" });
        } else {
          console.log("Columna eliminada con éxito.");
          res.json({ mensaje: "Columna eliminada con éxito" });
        }
      });
    } catch (error) {
      console.error("Error al actualizar la bbdd:", error);
      res.status(500).send("Error interno del servidor");
    }
  },
  deleteColumnEquipment: async (req, res) => {
    try {
      const { columna } = req.body;
      const query =
        'ALTER TABLE public."5- List of Equipment of each room" DROP COLUMN IF EXISTS' +
        '"' +
        columna +
        '"';
      // Ejecutar la consulta SQL
      pool.query(query, (error, resultados) => {
        if (error) {
          console.error("Error al eliminar la columna:", error);
          res.status(500).json({ mensaje: "Error al eliminar la columna" });
        } else {
          console.log("Columna eliminada con éxito.");
          res.json({ mensaje: "Columna eliminada con éxito" });
        }
      });
    } catch (error) {
      console.error("Error al actualizar la bbdd:", error);
      res.status(500).send("Error interno del servidor");
    }
  },
};
function cleanString(cadena) {
  // Eliminar caracteres no deseados (todo lo que no sea letras o números)
  cadena = cadena.replace(/[^a-zA-Z0-9\s]/g, "");
  // Sustituir espacios por barras bajas
  cadena = cadena.replace(/\s+/g, "_");
  return cadena;
}
module.exports = postgres;
