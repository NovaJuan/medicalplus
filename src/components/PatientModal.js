import { useState, useEffect } from "react";

const { ipcRenderer } = window.require("electron");

function PatientModal({ id, closeModal }) {
  const [patient, setPatient] = useState(null);
  const [changing, setChanging] = useState(false);
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({
    name: null,
    document: null,
    age: null,
    height: null,
    weight: null,
    story: null,
  });

  useEffect(() => {
    if (patient === null) {
      loadPatient(id);
    }
  }, [patient, id]);

  const loadPatient = (id) => {
    ipcRenderer.invoke("patients", "get", id).then((res) => {
      setErrors({
        name: null,
        document: null,
        age: null,
        height: null,
        weight: null,
        story: null,
      });
      setPatient({ ...res });
      setImage(`file://static/images/${res.image || "no-image.jpg"}`);
      setChanging(false);
    });
  };

  const deletePatient = () => {
    ipcRenderer
      .invoke("patients", "delete", id)
      .then((res) => res === true && closeModal());
  };

  const onChange = (e) => {
    setChanging(true);

    const { id, files } = e.target;
    let { value } = e.target;

    if (id === "image") {
      setImage(files[0].path);
      setPatient({
        ...patient,
        image: files[0].path,
      });
      return;
    }

    if ((id === "age" || id === "weight" || id === "height") && isNaN(value)) {
      return;
    }

    if (id === "document") {
      value = value.toUpperCase();
    }

    setPatient({
      ...patient,
      [id]: value,
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;

    let data = { ...patient };
    delete data.image;

    const newErrors = {
      name: null,
      document: null,
      age: null,
      height: null,
      weight: null,
      story: null,
    };

    for (const field of Object.entries(data)) {
      if (field[1] === "") {
        newErrors[field[0]] = "This field is required";
        hasError = true;
      }

      if (field[0] === "document") {
        // Send data to database
        const res = await ipcRenderer.invoke("patients", "check_document", {
          doc: patient.document,
          id,
        });

        if (res === true) {
          newErrors[field[0]] = "Document already in use";

          hasError = true;
        }
      }
    }

    if (hasError) {
      setErrors({ ...newErrors });
      return;
    }

    // Send data to database
    ipcRenderer
      .invoke("patients", "update", { id, patient })
      .then((res) => res === true && loadPatient(id));
  };

  if (patient === null) {
    return (
      <div className="PatientModal" data-closemodal={true} onClick={closeModal}>
        <div className="modal">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="PatientModal" data-closemodal={true} onClick={closeModal}>
      <div className="modal-container" data-closemodal={true}>
        <div className="modal">
          <h1>
            {patient.name}'s story
            <span className="close-btn" data-closemodal={true}>
              &times; Close
            </span>
          </h1>
          <form onSubmit={onSubmit}>
            <div className="columns">
              <div className="picture">
                <img src={image} alt={patient.name} />
                <div>
                  <label htmlFor="image">Change Picture</label>
                  <input type="file" id="image" onChange={onChange} />
                </div>
              </div>
              <div className="info">
                <div className="field">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    onChange={onChange}
                    value={patient.name}
                  />
                  {errors.name && (
                    <small className="error">{errors.name}</small>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="document">Document ID</label>
                  <input
                    type="text"
                    id="document"
                    onChange={onChange}
                    value={patient.document}
                  />
                  {errors.document && (
                    <small className="error">{errors.document}</small>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="age">Age</label>
                  <input
                    type="text"
                    id="age"
                    onChange={onChange}
                    value={patient.age}
                  />
                  {errors.age && <small className="error">{errors.age}</small>}
                </div>
                <div className="field">
                  <label htmlFor="weight">Weight (KG)</label>
                  <input
                    type="text"
                    id="weight"
                    onChange={onChange}
                    value={patient.weight}
                  />
                  {errors.weight && (
                    <small className="error">{errors.weight}</small>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="height">Height (cm)</label>
                  <input
                    type="text"
                    id="height"
                    onChange={onChange}
                    value={patient.height}
                  />
                  {errors.height && (
                    <small className="error">{errors.height}</small>
                  )}
                </div>
              </div>
            </div>
            <div className="story">
              <label htmlFor="story">Medical Story</label>
              {errors.story && <small className="error">{errors.story}</small>}
              <textarea
                id="story"
                rows="20"
                onChange={onChange}
                value={patient.story}
              ></textarea>
            </div>
            <div className="button-group">
              <button className="save" disabled={!changing} type="submit">
                Save Changes
              </button>
              <button
                className="discard"
                disabled={!changing}
                onClick={() => loadPatient(id)}
              >
                Discard Changes
              </button>
              <button className="delete" onClick={deletePatient}>
                Delete Patient
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PatientModal;
