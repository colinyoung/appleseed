import db from '../db';
import { logError } from '../logger';
import { migrate } from '../migrate';

// Run migrations
migrate(db);
