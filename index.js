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

let approvedSenders = [
  "no-reply@accounts.google.com",
  "bestbuycard@info6.accountonline.com"
];

imaps.connect(config).then(function handleConnectionSuccess(connection) {
  return connection.openBox("INBOX").then(() => {
    var delay = 24 * 3600 * 1000 * 4;
    var lastYear = new Date();
    lastYear.setTime(Date.now() - delay);
    lastYear = lastYear.toISOString();
    const searchCriteria = ["UNSEEN", ["SINCE", lastYear]];
    const fetchOptions = {
      bodies: ["HEADER", "TEXT"],
      markSeen: false
    };
    connection
      .search(searchCriteria, fetchOptions)
      .then(function parseResult(results) {
        results.forEach(result => {
          let header = result.parts[0];
          console.log("Sender", header.body.sender);
          console.log("from", header.body.from);
          console.log("Subject", header.body.subject);
          //   console.log("Unsubscribe email", header["list-unsubscribe"]);
          let text = result.parts[1];
          //   console.log(result.parts[0].body);
          try {
            if (result.parts[0].body["list-unsubscribe"]) {
              console.log(
                "list-unsubscribe",
                result.parts[0].body["list-unsubscribe"]
              );
            }
          } catch (e) {}
        });
      });
  });
}, console.error);
