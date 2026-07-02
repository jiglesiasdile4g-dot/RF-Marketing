/**
 * Script de un solo uso para obtener el GOOGLE_REFRESH_TOKEN.
 *
 * Requisitos previos:
 *   1. GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en server/.env
 *   2. Si el cliente OAuth es de tipo "Web application", añadir
 *      http://localhost:53682/oauth2callback a sus Authorized redirect URIs
 *      en Google Cloud Console.
 *
 * Uso: npm run get-refresh-token
 * Abre la URL que imprime, inicia sesión con la cuenta propietaria de la hoja
 * RF_Marketing y acepta. El token se imprime listo para pegar en .env.
 */
import 'dotenv/config';
