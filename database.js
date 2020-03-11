// Ensure Environment configuration
require("dotenv").config();

const sqlite3 = require("sqlite3");
let os = require("os");
// if this is a local console or desktop app, it would make sense to default
// the database name to the name of the user when using sqlite3.
// however, if the program transitions to postgres, there may need to be another
// strategy in place

// get database name from config, then default to os user info;
let DBName = process.env.DBNAME || require("os").userInfo().username;

// try to open the database
let up = `CREATE TABLE IF NOT EXISTS users (
    id NUM NOT NULL,
    email TEXT,
    password TEXT,
    username TEXT
)`;
let db;
let dbconnectionString = `./${DBName}.icloud-mail-unsubscribe.db`;
try {
  db = new sqlite3.Database(
    dbconnectionString,

    (handleInitialConnection = error => {
      console.log("connection Successful, running 'up' script");
      db.run(up);
      db.close();
    })
  );
} catch (e) {
  console.error(e);
}

function createUser(userID, email, password, username) {
  db = new sqlite3.Database(
    dbconnectionString,
    (doCreateUser = error => {
      if (error) {
        throw error;
      }

      let statement = db.prepare(
        "INSERT INTO users Values (id ?, email ?, pasword ?, username ?"
      );
      statement.run(userID, email, password, username);
      statement.finalize(error => {
        console.error("CreateUser statement finalize error", error);
        db.rollback();
      });
      db.close();
    })
  );
}
