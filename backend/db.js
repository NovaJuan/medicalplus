const sqlite3 = require("sqlite3");
const path = require("path");

const db = new sqlite3.Database(path.join(__dirname, "database.db"), (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
});

db.run(
  `
  CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      name TEXT NOT NULL,
      document TEXT UNIQUE NOT NULL,
      age INTEGER NOT NULL,
      height INTEGER NOT NULL,
      weight INTEGER NOT NULL,
      story TEXT,
      image TEXT
  )
  `
);

const DB = {};

DB.Query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) {
        return reject(err);
      }

      resolve(this);
    });
  });

DB.GetAll = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        return reject(err);
      }

      resolve(rows);
    });
  });

DB.Get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        return reject(err);
      }

      resolve(row);
    });
  });

module.exports = DB;
