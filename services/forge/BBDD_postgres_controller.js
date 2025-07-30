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
    const statement =
      'SELECT public."2-Room Type".* FROM public."2-Room Type" JOIN public."1-BIM&Rooms Relation" ON public."2-Room Type"."SOA_KEY" = "1-BIM&Rooms Relation"."SOA_KEY_REVIT" WHERE "1-BIM&Rooms Relation"."NUMERO_HABITACION" =' +
      "'" +
      room_code_pg +
      "'";
    pool.query(statement, (error, results) => {
      if (error) throw error;
      response.status(200).json(results.rows);
    });
  },

  getDataEquipment: (request, response) => {
    const room_code_pg = request.query.room_code;
    const statement =
      'SELECT * FROM public."5- List of Equipment of each room" WHERE "NUMERO_HABITACION"=' +
      "'" +
      room_code_pg +
      "'";
    pool.query(statement, (error, results) => {
      if (error) throw error;
      response.status(200).json(results.rows);
    });
  },

  getColumnsEquipment: async (request, response) => {
    const statement =
      "SELECT column_name FROM information_schema.columns WHERE table_name = '5- List of Equipment of each room'";
    pool.query(statement, (error, results) => {
      if (error) throw error;
      response.status(200).json(results.rows);
    });
  },

  getColumnsRoom: async (request, response) => {
    const statement =
      "SELECT column_name FROM information_schema.columns WHERE table_name = '2-Room Type'";
    pool.query(statement, (error, results) => {
      if (error) throw error;
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
      const valorLimpio = cleanString(valor);
      const query =
        'ALTER TABLE public."2-Room Type" ADD COLUMN ' +
        valorLimpio +
        " character varying(255);";
      pool.query(query, (error) => {
        if (error) {
          console.error("Error al añadir la columna:", error);
          res.status(500).json({ mensaje: "Error al añadir la columna" });
        } else {
          res.json({ mensaje: "Columna añadida con éxito" });
        }
      });
    } catch (error) {
      console.error("Error al añadir la columna:", error);
      res.status(500).send("Error interno del servidor");
    }
  },

  addColumnEquipment: async (req, res) => {
    try {
      const { valor } = req.body;
      const valorLimpio = cleanString(valor);
      const query =
        'ALTER TABLE public."5- List of Equipment of each room" ADD COLUMN ' +
        valorLimpio +
        " character varying(255)";
      pool.query(query, (error) => {
        if (error) {
          console.error("Error al añadir la columna:", error);
          res.status(500).json({ mensaje: "Error al añadir la columna" });
        } else {
          res.json({ mensaje: "Columna añadida con éxito" });
        }
      });
    } catch (error) {
      console.error("Error al añadir la columna:", error);
      res.status(500).send("Error interno del servidor");
    }
  },

  deleteColumnRoom: async (req, res) => {
    try {
      const { columna } = req.body;
      const query =
        'ALTER TABLE public."2-Room Type" DROP COLUMN IF EXISTS "' + columna + '"';
      pool.query(query, (error) => {
        if (error) {
          console.error("Error al eliminar la columna:", error);
          res.status(500).json({ mensaje: "Error al eliminar la columna" });
        } else {
          res.json({ mensaje: "Columna eliminada con éxito" });
        }
      });
    } catch (error) {
      console.error("Error al eliminar la columna:", error);
      res.status(500).send("Error interno del servidor");
    }
  },

  deleteColumnEquipment: async (req, res) => {
    try {
      const { columna } = req.body;
      const query =
        'ALTER TABLE public."5- List of Equipment of each room" DROP COLUMN IF EXISTS "' +
        columna +
        '"';
      pool.query(query, (error) => {
        if (error) {
          console.error("Error al eliminar la columna:", error);
          res.status(500).json({ mensaje: "Error al eliminar la columna" });
        } else {
          res.json({ mensaje: "Columna eliminada con éxito" });
        }
      });
    } catch (error) {
      console.error("Error al eliminar la columna:", error);
      res.status(500).send("Error interno del servidor");
    }
  },

  getBuildingType: async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT buildingtype FROM public."2-Room Type" LIMIT 1`
      );
      if (result.rows.length > 0 && result.rows[0].buildingtype) {
        res.status(200).json({ buildingtype: result.rows[0].buildingtype });
      } else {
        res.status(200).json({ buildingtype: null });
      }
    } catch (error) {
      console.error("Error fetching buildingtype:", error);
      res.status(500).send("Error interno del servidor");
    }
  },
};

function cleanString(cadena) {
  cadena = cadena.replace(/[^a-zA-Z0-9\s]/g, "");
  cadena = cadena.replace(/\s+/g, "_");
  return cadena;
}

module.exports = postgres;
