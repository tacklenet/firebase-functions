const functions = require("firebase-functions");
const fs = require("fs");

let config = functions.config();

if (process.env.NODE_ENV !== "production") {
  if (fs.existsSync("./env.json")) {
    const env = require("./env.json");

    config = env;
  }
}

function headers(host) {
  var headers = {
    "x-rapidapi-key": config.config.rapidkey,
    "x-rapidapi-host": host,
    useQueryString: true
  };

  return headers;
}

module.exports = headers;
