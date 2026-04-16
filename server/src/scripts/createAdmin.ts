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
import { createUser, getUserByEmail, deleteUser } from '../services/airtable.js';
import { hashPassword } from '../utils/password.js';

const ADMIN_EMAIL = 'admin@rentaflow.es';
const ADMIN_PASSWORD = 'admin1234';
const ADMIN_NOMBRE = 'Administrador';

async function main() {
  console.log('Verificando si el usuario ya existe...');

  const existing = await getUserByEmail(ADMIN_EMAIL);

  if (existing) {
    console.log(`⚠️  El usuario ${ADMIN_EMAIL} ya existe. Eliminando para recrearlo con contraseña correcta...`);
    await deleteUser(existing.id);
    console.log(`✓ Usuario eliminado`);
  }

  console.log('Hasheando contraseña...');
  const passwordHash = await hashPassword(ADMIN_PASSWORD);

  console.log('Creando usuario administrador...');

  const user = await createUser({
    email: ADMIN_EMAIL,
    passwordHash,
    nombre: ADMIN_NOMBRE,
    role: 'admin',
  });

  console.log(`✓ Usuario creado:
  - Email: ${ADMIN_EMAIL}
  - Contraseña: ${ADMIN_PASSWORD}
  - Nombre: ${ADMIN_NOMBRE}
  - Rol: admin
  - ID Airtable: ${user.id}`);

  console.log('\n⚠️  Cambia la contraseña después del primer login.');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
