import db from '../db';
import { migrate } from '../migrate';

// Run migrations
migrate(db);
