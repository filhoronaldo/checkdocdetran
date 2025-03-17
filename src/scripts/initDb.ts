
import { logInitialDataSQL } from '@/utils/databaseSetup';

// This is a simple script to generate the SQL statements for the initial data
// Run this script using "node -r esbuild-register src/scripts/initDb.ts"
// Then copy the output and execute it in your Supabase SQL editor

// Log the SQL to the console
logInitialDataSQL();

console.log('\n\n--- Copy the SQL statements above and execute them in your Supabase SQL editor ---');
