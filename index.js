require("dotenv").config();
const imaps = require("imap-simple");
// console.log("ENV", process.env);

const config = {
  imap: {
    user: process.env.ICLOUD_EMAIL_ADDRESS,
    password: process.env.ICLOUD_PASSWORD,
    host: process.env.ICLOUD_HOST,
    port: process.env.ICLOUD_PORT,
    tls: true
  }
};
imaps.connect(config).then(function handleConnectionSuccess(connection) {
  return connection.openBox("INBOX").then(() => {
    var delay = 24 * 3600 * 1000;
    var yesterday = new Date();
    yesterday.setTime(Date.now() - delay);
    yesterday = yesterday.toISOString();
    const searchCriteria = ["SEEN", ["SINCE", yesterday]];
    const fetchOptions = {
      bodies: ["HEADER"],
      markSeen: false
    };
    connection
      .search(searchCriteria, fetchOptions)
      .then(function parseResult(results) {
        results.forEach(result => {
          console.dir(result);
        });
      });
  });
}, console.error);
