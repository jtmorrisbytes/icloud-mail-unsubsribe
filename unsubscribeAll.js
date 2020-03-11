require("dotenv").config;

SMTPClient = require("smtp-client").SMTPClient;

let client = new SMTPClient({
  host: "smtp.mail.me.com",
  port: 587,
  secure: true
});

async function sendmail() {
  console.log("trying connection");
  //   await client.secure();
  await client.connect();
  await client.secure();
  console.log("ran connect");
  await client.greet({ hostname: "smtp.mail.me.com" });
  console.log("greeted server");
  await client.authLogin({
    username: process.env.ICLOUD_EMAIL_ADDRESS,
    password: ICLOUD_PASSWORD
  });
  console.log("logged in");
  await client.mail({ from: process.env.ICLOUD_EMAIL_ADDRESS });
  await client.rcpt({ to: "jthecybertinkerer@gmail.com" });
  await client.data("HELLO WORLD FROM JORDAN MORRIS, AUTOMATED UNSUBSCRIBER");
  await client.quit();
}
sendmail().catch(console.error);
