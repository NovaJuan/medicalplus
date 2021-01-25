const { app, BrowserWindow, protocol, ipcMain, dialog } = require("electron");
const path = require("path");
const DB = require("./db");

let win;

function startApp() {
  const registered = protocol.interceptFileProtocol(
    "file",
    (request, callback) => {
      const url = request.url.substr(7).replace(/(%20)+/g, " ");

      if (request.url.includes("file://static")) {
        callback(path.join(__dirname, url));
      } else {
        callback(url);
      }
    }
  );

  if (!registered) {
    throw new Error("Failed to register the protocol.");
  }

  win = new BrowserWindow({
    width: 800,
    minWidth: 750,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: process.env.NODE_ENV !== "development",
    },
  });

  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:3000");
  } else {
    win.loadFile(path.join(__dirname, "../build/index.html"));
  }
}

// Start the application
app.whenReady().then(startApp);

ipcMain.handle("patients", require("./actions/patients"));

process.on("unhandledRejection", (err) => {
  dialog.showErrorBox("An Error Occurred", err.stack);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  dialog.showErrorBox("An Error Occurred", err.stack);
  process.exit(1);
});
