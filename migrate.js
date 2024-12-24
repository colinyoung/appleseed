import { query } from './db.js';
import fs from 'fs';
import { parse } from 'csv-parse';

const migrations = [
    // Create migrations table
    `CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Create tree_requests table
    `CREATE TABLE IF NOT EXISTS tree_requests (
        id SERIAL PRIMARY KEY,
        sr_number VARCHAR(50) UNIQUE NOT NULL,
        street_address TEXT NOT NULL,
        num_trees INTEGER NOT NULL DEFAULT 1,
        location TEXT NOT NULL,
        requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'completed',
        notes TEXT
    )`,

    // Create index on sr_number
    `CREATE INDEX IF NOT EXISTS idx_tree_requests_sr_number ON tree_requests(sr_number)`,

    // Create index on street_address
    `CREATE INDEX IF NOT EXISTS idx_tree_requests_street_address ON tree_requests(street_address)`
];

async function runMigration(migration, index) {
    try {
        // Check if migration was already executed
        const migrationCheck = await query(
            'SELECT id FROM migrations WHERE name = $1',
            [`migration_${index + 1}`]
        );

        if (migrationCheck.rows.length === 0) {
            // Run migration
            await query(migration);
            
            // Record migration
            await query(
                'INSERT INTO migrations (name) VALUES ($1)',
                [`migration_${index + 1}`]
            );
            
            console.log(`Migration ${index + 1} executed successfully`);
        } else {
            console.log(`Migration ${index + 1} already executed`);
        }
    } catch (error) {
        console.error(`Error executing migration ${index + 1}:`, error);
        throw error;
    }
}

async function importExistingData() {
    const filename = "./srNumbers.csv";
    
    try {
        if (!fs.existsSync(filename)) {
            console.log('No existing data to import');
            return;
        }

        const fileContent = fs.readFileSync(filename, 'utf8');
        
        // Parse CSV file
        const records = await new Promise((resolve, reject) => {
            parse(fileContent, {
                columns: true,
                skip_empty_lines: true,
                ltrim: true,
                relax_column_count: true
            }, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });

        // Import records
        for (const record of records) {
            try {
                await query(
                    `INSERT INTO tree_requests 
                     (sr_number, street_address, num_trees, location, requested_at)
                     VALUES ($1, $2, $3, $4, $5)
                     ON CONFLICT (sr_number) DO NOTHING`,
                    [
                        record['SR Number'],
                        record['Address'],
                        parseInt(record['Number Of Trees'] || '1'),
                        record['Description'] || 'Parkway',
                        new Date(record['Requested Date'])
                    ]
                );
            } catch (error) {
                console.error('Error importing record:', record, error);
            }
        }

        console.log(`Imported ${records.length} existing records`);
    } catch (error) {
        console.error('Error importing existing data:', error);
    }
}

async function migrate() {
    console.log('Starting database migrations...');
    
    for (let i = 0; i < migrations.length; i++) {
        await runMigration(migrations[i], i);
    }
    
    console.log('Migrations completed');
    
    console.log('Importing existing data...');
    await importExistingData();
    console.log('Data import completed');
}

// Run migrations
migrate().catch(console.error);