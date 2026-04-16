/**
 * Script para crear el primer usuario administrador.
 * Uso: npx tsx src/scripts/createAdmin.ts
 *
 * IMPORTANTE: La tabla USUARIOS debe existir en Airtable con los campos:
 *   - Email (Single line text)
 *   - PasswordHash (Long text)
 *   - Nombre (Single line text)
 *   - Role (Single line text)
 */
import 'dotenv/config';
