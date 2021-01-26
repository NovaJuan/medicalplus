import { useState } from "react";
import { useHistory } from "react-router-dom";

const { ipcRenderer } = window.require("electron");

function CreatePatient() {
  const history = useHistory();

  const [patient, setPatient] = useState({
    name: "",
    age: "",
    weight: "",
    height: "",
    story: "",
    document: "",
    image: null,
  });

  const [errors, setErrors] = useState({
    name: null,
    age: null,
    weight: null,
    height: null,
    story: null,
    document: null,
  });

  const [image, setImage] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;

    let data = { ...patient };
    delete data.image;

    const newErrors = {
      ...errors,
    };

    for (const field of Object.entries(data)) {
      if (field[1] === "") {
        newErrors[field[0]] = "This field is required";
        hasError = true;
      } else {
        newErrors[field[0]] = "";
      }

      if (field[0] === "document") {
        // Send data to database
        const res = await ipcRenderer.invoke("patients", "check_document", {
          doc: patient.document,
        });

        if (res === true) {
          newErrors[field[0]] = "Document already in use";

          hasError = true;
        }
      }
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    // Send data to database
    ipcRenderer
      .invoke("patients", "create", patient)
      .then((res) => res === true && history.push("/"));
  };

  const onChange = (e) => {
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

  return (
    <div className="CreatePatient">
      <h1>Create New Patient</h1>
      <form onSubmit={onSubmit} className="patient-form">
        <div className="columns">
          <div className="picture">
            <img
              src={image === null ? "file://static/images/no-image.jpg" : image}
              alt={patient.name}
            />
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
              {errors.name && <small className="error">{errors.name}</small>}
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
        <button
          className="save"
          style={{ margin: "0 auto", display: "block" }}
          type="submit"
        >
          Save
        </button>
      </form>
    </div>
  );
}

export default CreatePatient;
