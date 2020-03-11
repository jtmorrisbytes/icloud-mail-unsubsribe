require("dotenv").config();
const imaps = require("imap-simple");
// console.log("ENV", process.env);
const fs = require("fs");

let subscriptionsList = fs
  .readFileSync("subscriptionsList.txt")
  .toLocaleString()
  .split("\n");

let stdio = require("readline-sync");

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
    var delay = 24 * 3600 * 1000 * 300;
    var lastYear = new Date();
    lastYear.setTime(Date.now() - delay);
    lastYear = lastYear.toISOString();
    const searchCriteria = [
      "ALL",
      ["SINCE", lastYear],
      ["HEADER", "list-unsubscribe", "mailto:"]
    ];
    const fetchOptions = {
      bodies: ["HEADER"],
      markSeen: false
    };
    connection
      .search(searchCriteria, fetchOptions)
      .then(function parseResult(results) {
        results.forEach(result => {
          let header = result.parts[0];
          // console.log("Sender", header.body.sender);

          if (header.body["list-unsubscribe"]) {
            // console.log("from", header.body.from);
            // console.log("Subject", header.body.subject);
            // console.log("list-unsubscribe");

            subscriptionsList.push(
              header.body["list-unsubscribe"]
                .map(value => {
                  if (
                    value.__proto__.constructor === [].__proto__.constructor
                  ) {
                    return value[value.indexOf("mailto")] || "";
                  } else if (typeof value === "string") {
                    if (value.includes(",")) {
                      return value.split(",").indexOf("mailto");
                    }
                    return value.slice(value.indexOf("mailto")) || "";
                  }
                  return "";
                })
                .filter(value => {
                  return value && value.length > 0;
                })
                .toString()
                .replace(/</g, "")
                .replace(/>/g, "")
                .trim()
            );
          }
        });
        connection.end();
      });
  });
});

function cleanupResources() {
  console.log("\r\nCleaning up before exiting...");
  removeDupes(subscriptionsList);
  fs.writeFileSync("subscriptionsList.txt", subscriptionsList.join("\n"), {
    flag: "w",
    encoding: "utf-8"
  });
  // process.exit();
}

function removeDupes(emailList) {
  console.log("processing dupes");
  for (
    let upperBounds = emailList.length - 1;
    upperBounds >= 0;
    upperBounds--
  ) {
    for (let searchIndex = upperBounds - 1; searchIndex >= 0; searchIndex--) {
      if (emailList[upperBounds] === emailList[searchIndex]) {
        emailList.splice(upperBounds, 1);
        if (upperBounds < emailList.length - 1) {
          upperBounds++;
        }
      }
    }
  }
}

process.on("SIGINT", () => {
  process.exit();
});
// process.on("SIGTERM", cleanupResources);
process.on("exit", cleanupResources);
process.on("error", error => {
  console.log(" an errror occured", error);
  process.exit(-1);
});
