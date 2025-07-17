require('dotenv').config();

const express = require('express'); // npm install express
const session = require('cookie-session'); // npm install cookie-session
const { PORT, SERVER_SESSION_SECRET } = require('./config.js'); // importa PORT de config.js


let app = express(); // crea una instancia de nuestro servidor importando la funcion express importada  del modulo npm express
app.use(express.static('wwwroot')); // sirve el contenido de la carpeta wwwroot (cada solicitud que se haga al servidor, pasará por este middleware estatico)
app.use(session({ secret: SERVER_SESSION_SECRET, maxAge: 24 * 60 * 60 * 1000 })); // crea una sesion con la clave SERVER_SESSION_SECRET y una duracion de 24 horas
app.use(express.json());
app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/hubs', require('./routes/hubs.js'));

//rutas cargadas
var routes = require('./routes.js');

//routes
app.use('/api', routes);



app.listen(PORT,()=> console.log(`Server listening on port ${PORT}...`)); // inicia el servidor en el puerto PORT