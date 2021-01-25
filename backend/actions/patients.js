const { dialog, ipcMain } = require("electron");
const path = require("path");
const DB = require("../db");

const handler = (e, type, data) => {
  switch (type) {
    case "create":
      return createPatient(data);

    case "all":
      return getAllPatients();

    case "get":
      return getPatient(data);

    case "update":
      return updatePatient(data);

    case "delete":
      return deletePatient(data);

    case "check_document":
      return checkDocumentIDExists(data);

    default:
      return true;
  }
};

const createPatient = async (data) => {
  const { copyFile } = require("fs-extra");
  const { randomBytes } = require("crypto");

  const newPatient = { ...data };

  if (data.image !== null) {
    const extname = path.extname(data.image);
    newPatient.image = (await randomBytes(16).toString("hex")) + extname;
  }

  await DB.Query(
    "INSERT INTO patients (name,age,weight,height,story,document,image) VALUES (?,?,?,?,?,?,?)",
    [...Object.values(newPatient)]
  );

  if (data.image !== null) {
    await copyFile(
      data.image,
      path.join(__dirname, `../static/images/${newPatient.image}`)
    );
  }

  return true;
};

const checkDocumentIDExists = async ({ doc, id }) => {
  if (id) {
    return (
      (await DB.Get("SELECT 1 FROM patients WHERE document = ? AND id != ?", [
        doc,
        id,
      ])) !== undefined
    );
  }

  return (
    (await DB.Get("SELECT 1 FROM patients WHERE document = ?", [doc])) !==
    undefined
  );
};

const getAllPatients = async () => {
  return await DB.GetAll("SELECT * FROM patients");
};

const getPatient = async (id) => {
  return await DB.Get("SELECT * FROM patients WHERE id = ?", [id]);
};

const updatePatient = async ({ id, patient }) => {
  const { copyFile, unlink } = require("fs-extra");
  const { randomBytes } = require("crypto");

  const oldPatient = await DB.Get("SELECT * FROM patients WHERE id = ?", [id]);
  const newPatient = { ...patient };
  delete newPatient.id;

  if (oldPatient.image !== patient.image) {
    const extname = path.extname(patient.image);
    newPatient.image = (await randomBytes(16).toString("hex")) + extname;
  }

  await DB.Query(
    "UPDATE patients SET name = ?, document = ?, age = ?, height = ?, weight = ?, story = ?, image = ? WHERE id = ?",
    [...Object.values(newPatient), id]
  );

  if (oldPatient.image !== patient.image) {
    if (oldPatient.image !== null) {
      await unlink(
        path.join(__dirname, `../static/images/${oldPatient.image}`)
      );
    }
    await copyFile(
      patient.image,
      path.join(__dirname, `../static/images/${newPatient.image}`)
    );
  }

  return true;
};

const deletePatient = async (id) => {
  let options = {
    title: "Delete Patient",
    buttons: ["Yes", "No"],
    message: "Do you really want to delete this patient?",
  };

  const messageBox = await dialog.showMessageBox(options);

  if (messageBox.response !== 0) {
    return false;
  }

  const { unlink } = require("fs-extra");

  const patient = await DB.Get("SELECT * FROM patients WHERE id = ?", [id]);

  await DB.Query("DELETE FROM patients WHERE id = ?", [id]);

  if (patient.image !== null) {
    await unlink(path.join(__dirname, `../static/images/${patient.image}`));
  }

  return true;
};

module.exports = handler;
