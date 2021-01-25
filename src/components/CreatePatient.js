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
      <form onSubmit={onSubmit}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            onChange={onChange}
            value={patient.name}
          />
          <small className="error">{errors.name !== null && errors.name}</small>
        </div>
        <div>
          <label htmlFor="document">Document ID</label>
          <input
            type="text"
            id="document"
            onChange={onChange}
            value={patient.document}
          />
          <small className="error">
            {errors.document !== null && errors.document}
          </small>
        </div>
        <div>
          <label htmlFor="age">Age</label>
          <input type="text" id="age" onChange={onChange} value={patient.age} />
          <small className="error">{errors.age !== null && errors.age}</small>
        </div>
        <div>
          <label htmlFor="weight">Weight (KG)</label>
          <input
            type="text"
            id="weight"
            onChange={onChange}
            value={patient.weight}
          />
          <small className="error">
            {errors.weight !== null && errors.weight}
          </small>
        </div>
        <div>
          <label htmlFor="height">Height (cm)</label>
          <input
            type="text"
            id="height"
            onChange={onChange}
            value={patient.height}
          />
          <small className="error">
            {errors.height !== null && errors.height}
          </small>
        </div>
        <div>
          <label htmlFor="story">Medical Story</label>
          <textarea
            id="story"
            onChange={onChange}
            cols="30"
            rows="20"
            value={patient.story}
          ></textarea>
          <small className="error">
            {errors.story !== null && errors.story}
          </small>
        </div>
        <div>
          <label htmlFor="story">Patient Image</label>
          <input type="file" id="image" onChange={onChange} />
        </div>
        <div>
          <input type="submit" value="Save" />
        </div>
      </form>
    </div>
  );
}

export default CreatePatient;
