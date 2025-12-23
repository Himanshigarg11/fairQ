// import admin from "firebase-admin";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Load service account JSON manually
// const serviceAccountPath = path.join(__dirname, "firebaseServiceAccount.json");
// const serviceAccount = JSON.parse(
//   fs.readFileSync(serviceAccountPath, "utf-8")
// );

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });
// }

// export default admin;

import admin from "firebase-admin";

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error("❌ FIREBASE_SERVICE_ACCOUNT env variable is missing");
  process.exit(1);
}

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT
);

// Prevent re-initialization during hot reloads
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;

// {
//   "type": "service_account",
//   "project_id": "fairq-fb284",
//   "private_key_id": "2983fbdadf1d6e7f035f8a1c3f47812fe8cb574c",
//   "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC3Ms6ELZZC5hTo\nzl1p7yyz3rO/RJmgoiRtzVys1cOAD9+No6RhIKHvjsKl69WAKCWnbxtpQO+quqYc\naW8J12muVpqRwti58An4K+MS/ujxQMQ0C1k5N6evDr/iGdw62oipCaDQMtrP4IFE\nBTxGLtNiUPxGEFhoBSiFkgtc15iBgyhsGq69Nrwt+HCFmqbTW7dRUP6ormbwAgL+\nivyop3cqVykk2bE8ixywVJDkbJz6fQw4CsGqr0DVqi42clAoOQYnPvz0lYIxjWzA\n0r9Xoq/GUlWCZX00Pt5c2VFJT+n2cB0PQfRnMmrol8uLNAPRap5FrGqVnYtffT0D\nl05groGFAgMBAAECggEAAW7eUAkN7Ia25yimG8FejNGof6MzvclG66z4P/SJdk5U\nJgbVBFrS/s1pFw8vOQoXW/tHMEhCbQgkwILP9uMT1Tn235Ox9P0RtuVGU3cMWhwd\nl3f3Qgv+EyUpucUQr00tAIAuHTLTT15RjzdTRLadD18pegrVW4r0Htyzm2L8XcGm\nLOKGC+62gkr06wSowAscL1vfouVl/2HOgJEu792eDPVwHvu5TAFHiBZgseAv4spH\njSQ502x24HFuEkMy1Xf4cW4INS/uck6pYZzuVufIPkOOi5ZPxUkLf91990+vEE9R\nngEFJglArwzwcnqHEU3o0g2LxhN/s6p1wF6Xm551AQKBgQDjcXdYCUaDIKf9fFcG\nNfMdJiye/WG/V2Y0avYFvLX0YcMRnp38qdJa6BybcI22FPe6bBP46WfWTU9OFITp\nLDGy2Sq35TAOKAM9vE/Ez71kgTYcJllWIfVL8H8DDxhQqxYn6n6JbGlCnIMRrHJi\nW7jpq2mRe8LdV8bjM7tniuus4QKBgQDOMzcDlUPkqLZgvT3AOPFPXWF2lnnQ0aHb\nX3k/osLyWaUyR2SDG0F6MSCZHOBaQfv+hyo7x8rC9rl+vxZ3oRQFCkNjvm6f3GC6\nCFm5CABZ5QCFsC0Y9UAxGEy9rj28lbreLcQsiGaXqtARDDW02hMuy64g3PbBFvHl\n4an6XuIlJQKBgAvsqwEmm1fMooIbvsRIl9Jzaet8BV/uySD+ap+qYS/K4FtQIaBZ\nlvnFKZrMr+FYABT6DaIDOrp1my7QzJcdBg4GbMLvdTGIz4KxGM2MxrU6QQgAyrZF\nWYL9vOsAI5o3HhZBqRizYmFnq0eF7wlRHcTCg+povrK0I21ODQlEs06BAoGAOofp\nJtg49HA7jMxK+gRv4xJjtxDRtUe8RRQdy8V8xuRRcys2ycxz0qadVTkQKi6uxDpD\n78IvuRXl46eETiLoFuIp7OdCaZhZ0JTMOyydROcvNcOjmYEMXqNCLVmHZr+t0qF1\nHRr+3DB9bUlk+Vgpt8/TNrriRD8qHRHoeQxz7w0CgYBV/B7lPHxlnd+YHeDyZNXD\n/ll+BHB1sV6JiwX/oMtvfOVV4Fg7VgIG3NThsWK3YM8dupdR7udZsosaHVh4l//n\nGGqnhgk4vyvG9PKAiF/preMtdpUhAWHugYs7asxtHhgMPFtbwJAytlxrX5XZI98j\nV+RgZIctlGnij/1SDwCZkw==\n-----END PRIVATE KEY-----\n",
//   "client_email": "firebase-adminsdk-fbsvc@fairq-fb284.iam.gserviceaccount.com",
//   "client_id": "113808047410710435316",
//   "auth_uri": "https://accounts.google.com/o/oauth2/auth",
//   "token_uri": "https://oauth2.googleapis.com/token",
//   "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
//   "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40fairq-fb284.iam.gserviceaccount.com",
//   "universe_domain": "googleapis.com"
// }
