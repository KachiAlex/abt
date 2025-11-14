// Firebase Functions entry point - minimal for fast deployment
// This avoids timeout by exporting function immediately
exports.apiV1 = require('./dist/index.js').apiV1;
