/**
 * Script to check the structure of the USUARIOS table
 */
import 'dotenv/config';
import Airtable from 'airtable';
const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(process.env.AIRTABLE_BASE_ID);
async function main() {
    try {
        const usersTable = base('USUARIOS');
        const records = await usersTable.select({ maxRecords: 1 }).all();
        if (records.length === 0) {
            console.log('USUARIOS table is empty. Checking table schema...');
            // Try to create a dummy record to see what fields are required
            console.log('Table exists but is empty.');
        }
        else {
            console.log('Sample record from USUARIOS table:');
            console.log(JSON.stringify(records[0].fields, null, 2));
        }
    }
    catch (error) {
        console.error('Error accessing USUARIOS table:', error instanceof Error ? error.message : error);
    }
}
main();
