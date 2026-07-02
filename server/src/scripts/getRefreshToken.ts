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
import http from 'node:http';
import { google } from 'googleapis';

const PORT = 53682;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error('Faltan GOOGLE_CLIENT_ID y/o GOOGLE_CLIENT_SECRET en server/.env');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent', // obligatorio: Google solo devuelve refresh_token al re-consentir
  scope: ['https://www.googleapis.com/auth/spreadsheets'],
});

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', REDIRECT_URI);
    if (url.pathname !== '/oauth2callback') {
      res.writeHead(404).end();
      return;
    }

    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error || !code) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h3>Error en la autorización. Revisa la consola.</h3>');
      console.error('Error de autorización:', error ?? 'sin código');
      process.exit(1);
    }

    const { tokens } = await oauth2Client.getToken(code);

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h3>Listo, puedes cerrar esta pestaña.</h3>');

    if (!tokens.refresh_token) {
      console.error(
        '\nGoogle no devolvió refresh_token. Revoca el acceso previo de la app en\n' +
        'https://myaccount.google.com/permissions y vuelve a ejecutar el script.'
      );
      process.exit(1);
    }

    console.log('\nRefresh token obtenido. Pega esta línea en server/.env:\n');
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('Error intercambiando el código:', err instanceof Error ? err.message : err);
    res.writeHead(500).end();
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log('Abre esta URL en el navegador y autoriza el acceso:\n');
  console.log(authUrl + '\n');
  console.log(`Esperando el callback en ${REDIRECT_URI} ...`);
});
