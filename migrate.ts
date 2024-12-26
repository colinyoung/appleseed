import { DB } from './db';
import fs from 'fs';
import { parse } from 'csv-parse';
import { logDebug, logError } from './logger';

const CREATE_MIGRATIONS_TABLE = `CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

const migrations = [
  // Create migrations table
  CREATE_MIGRATIONS_TABLE,

  // Create tree_requests table
  `CREATE TABLE IF NOT EXISTS tree_requests (
        id SERIAL PRIMARY KEY,
        sr_number VARCHAR(50) UNIQUE NOT NULL,
        street_address TEXT NOT NULL,
        num_trees INTEGER NOT NULL DEFAULT 1,
        location TEXT NOT NULL,
        requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'completed',
        zipcode VARCHAR(10) DEFAULT '',
        confirmed_planted BOOLEAN DEFAULT FALSE,
        notes TEXT
    )`,

  // Create index on sr_number
  `CREATE INDEX IF NOT EXISTS idx_tree_requests_sr_number ON tree_requests(sr_number)`,

  // Create index on street_address
  `CREATE INDEX IF NOT EXISTS idx_tree_requests_street_address ON tree_requests(street_address)`,
];

export async function runMigration(db: DB, migration: string, index: number) {
  try {
    // Check if migration was already executed
    const migrationCheck = await db.query('SELECT id FROM migrations WHERE name = $1', [
      `migration_${index + 1}`,
    ]);

    if (migrationCheck.rows.length === 0) {
      // Run migration
      await db.query(migration, []);

      // Record migration
      await db.query('INSERT INTO migrations (name) VALUES ($1)', [`migration_${index + 1}`]);

      logDebug(`Migration ${index + 1} executed successfully`);
    } else {
      logDebug(`Migration ${index + 1} already executed`);
    }
  } catch (error) {
    if ((error as Error).message.includes('relation "migrations" does not exist')) {
      logDebug('Migrations table does not exist, creating it...');
      await db.query(CREATE_MIGRATIONS_TABLE, []);
      logDebug('Migrations table created, now run again');
      return;
    } else {
      logError(`Error executing migration ${index + 1}:`, error);
      throw error;
    }
  }
}

export async function importExistingData(db: DB) {
  const filename = './srNumbers.csv';

  try {
    if (!fs.existsSync(filename)) {
      logDebug('No existing data to import');
      return;
    }

    const fileContent = fs.readFileSync(filename, 'utf8');

    // Parse CSV file
    const records: Record<string, string>[] = await new Promise((resolve, reject) => {
      parse(
        fileContent,
        {
          columns: true,
          skip_empty_lines: true,
          ltrim: true,
          relax_column_count: true,
        },
        (err, data) => {
          if (err) reject(err);
          else resolve(data);
        },
      );
    });

    // Import records
    for (const record of records) {
      try {
        await db.query(
          `INSERT INTO tree_requests 
                     (sr_number, street_address, zipcode, num_trees, location, requested_at, confirmed_planted)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)
                     ON CONFLICT (sr_number) DO NOTHING`,
          [
            record['SR Number'],
            record['Address'],
            record['Zipcode'],
            parseInt(record['Number Of Trees'] || '1'),
            record['Location'] || 'Parkway',
            record['Request Date']
              ? new Date(record['Request Date']).toISOString()
              : new Date().toISOString(),
            record['Confirmed Planted'] === 'Yes',
          ],
        );
        logDebug('Imported record:', record);
      } catch (error) {
        console.error('Error importing record:', record, error);
      }
    }

    logDebug(`Imported ${records.length} existing records`);
  } catch (error) {
    console.error('Error importing existing data:', error);
  }
}

export async function migrate(db: DB) {
  logDebug('Starting database migrations...');

  for (let i = 0; i < migrations.length; i++) {
    await runMigration(db, migrations[i], i);
  }

  logDebug('Migrations completed');

  logDebug('Importing existing data...');
  await importExistingData(db);
  logDebug('Data import completed');
}
