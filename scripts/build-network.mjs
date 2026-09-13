import https from "node:https";

// next/font downloads many font subsets in parallel. Bound connections per host
// during builds; this preload is also inherited by Next.js build workers.
https.globalAgent.maxSockets = 6;
