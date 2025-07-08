const oracledb = require('oracledb');

 

 

const dbConfig = {

    host:'localhost:1521/xe',

    user:'JAVI',

    password:'JAVI',

    database:'BurgasHospital_DB',

    serviceName:'XE',

    connectString: 'localhost:1521/xe'

};

 

const query = {

  muestraDatos: async function(req, res) {

  let connection;

  const room_number = req.query.room_number;

 

   

  try {

    connection = await oracledb.getConnection(dbConfig);

    const sql = `SELECT "ROOM_NAME", "ROOM_CODE", "SOA_KEYREVIT", "DEPARTMENT","DEPARTMENT_CODE", "SECTION_NAME","SUBSECTION_NAME","AREA", "FUNCTIONAL_AREA", "EQUIPMENT", "CODE",

    "ITEM_LIST","ITEM_MACROCATEGORY", "ITEM_SUBCATEGORY", "ITEM_QTY", "ITEM_TOTAL_QTY", "ITEM_REMARKS", "ITEM_PROCUREMENT_INSTALLATION", "ITEM_INSTALLATION_REQUIREMENTS",

    "ITEM_COST_PER_UNIT", "SUBTOTAL" FROM EQUIPAMIENTO WHERE "NUMERO_HABITACION"=` +"'"+room_number+"'" ;

    const result = await connection.execute(sql);

    console.log(result.rows);

    res.json(result.rows);

   

   

  } catch (err) {

    console.error('Error:', err);

  }

}

 

}

module.exports=query;


/*
const sql = require('mssql');

const config = {
  server: "CBC2DS3\\SQLEXPRESS",
  database: "BurgasHospital",
  authenticationType: "Integrated",
  profileName: "jvicenteg",
  encrypt: "Mandatory",
  trustServerCertificate: true,
  user: "Burgas",
  password: "ejemplo123@",
  connectTimeout: 15,
  commandTimeout: 30,
  applicationName: "vscode-mssql"
};



const query = {
  muestraDatos: async function(req, res) {
  let connection;
  const room_number = req.query.room_number;
  
    
  try {
    connection = await sql.connect(config);
    const result = await sql.query('Select "ROOM CODE" from EQUIPAMIENTO WHERE "Numero habitacion"=' +"'"+room_number+"'");;
    console.log(result.rows);
    res.json(result.rows);
    
    
  } catch (err) {
    console.error('Error:', err);
  } 
}

}



module.exports = query;

const Connection = require('tedious').Connection;
const Request = require('tedious').Request;


const config = {
  server: '169.254.24.146', 
  database: 'BurgasHospital',
  userName: 'Burgas', 
  password: 'ejemplo123@', 
  options: {
    encrypt: true, // Habilitar cifrado (si es necesario)
    trustServerCertificate: true, // Confianza en el certificado del servidor (no recomendado en producción)
    enableArithAbort: true, 

  }
};



    //const room_number = req.query.room_number;

    const query = {
      muestraDatos: async function(req, res) {
      const room_number = req.query.room_number;
      
        
    try {
    const connection = new Connection(config);
    connection.connect();
    console.log(connection);
    connection.on('connect', (err) => {
      if (err) {
        console.error('Error al conectar:', err);
      } else {
        console.log('Conexión establecida con éxito.');

        const request = new Request('Select "ROOM CODE" from EQUIPAMIENTO WHERE "Numero habitacion"=' +"'"+room_number+"'");
        const result = connection.execSql(request);
        console.log(result.rows);
        res.json(result.rows);
      }
    
    });
  }catch (err) {
    console.error('Error:', err);
  } 
}}

module.exports = query;
*/
