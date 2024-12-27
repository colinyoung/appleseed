import db from '../db';
import { migrate } from '../migrate';

// Run migrations
console.log('Running migrations...');
migrate(db);
console.log('Migrations complete');
