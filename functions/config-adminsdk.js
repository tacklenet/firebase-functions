const functions = require("firebase-functions");
const fs = require("fs");

let config = functions.config();

if (process.env.NODE_ENV !== "production") {
  if (fs.existsSync("./env.json")) {
    const env = require("./env.json");

    config = env;
  }
}

module.exports = function adminsdk(host) {
  const adminsdk = {
    type: "service_account",
    project_id: "tackle-net",
    private_key_id: config.config.private_key_id,
    private_key: config.config.private_key.replace(/\\n/g, "\n"),
    client_email: "firebase-adminsdk-55yp5@tackle-net.iam.gserviceaccount.com",
    client_id: "113910551376909776800",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-55yp5%40tackle-net.iam.gserviceaccount.com",
  };

  return adminsdk;
};
