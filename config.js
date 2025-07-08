let {
  FORGE_CLIENT_ID,
  FORGE_CLIENT_SECRET,
  FORGE_CALLBACK_URL,
  SERVER_SESSION_SECRET,
  PORT,
  PG_HOST,
  PG_USER,
  PG_PASSWORD,
  PG_DATABASE,
  PG_PORT
} = process.env; // permite leer variables de entorno
if (
  !FORGE_CLIENT_ID ||
  !FORGE_CLIENT_SECRET ||
  !FORGE_CALLBACK_URL ||
  !SERVER_SESSION_SECRET
) {
  // si no existen las variables de entorno
  console.warn("Missing some of the environment variables."); // muestra un mensaje de error
  process.exit(1); // y termina el proceso
}
const INTERNAL_TOKEN_SCOPES = ["data:read", "data:create", "data:write"]; // scopes para el token interno
const PUBLIC_TOKEN_SCOPES = ["viewables:read"]; // scopes para el token publico
PORT = PORT || 3000; // EL PUERTO es 3000

module.exports = {
  // exporta las variables de entorno
  FORGE_CLIENT_ID, // exporta APS_CLIENT_ID
  FORGE_CLIENT_SECRET, // exporta APS_CLIENT_SECRET
  FORGE_CALLBACK_URL,
  SERVER_SESSION_SECRET,
  INTERNAL_TOKEN_SCOPES, // exporta INTERNAL_TOKEN_SCOPES
  PUBLIC_TOKEN_SCOPES, // exporta PUBLIC_TOKEN_SCOPES
  PORT, // exporta PORT
  PG_HOST,
  PG_USER,
  PG_PASSWORD,
  PG_DATABASE,
  PG_PORT
};
