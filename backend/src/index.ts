import * as functions from 'firebase-functions';
import app from './server';

// Export the Express app as a Firebase Function
export const api = functions.https.onRequest(app);
