import { useState, useEffect } from "react";
import PatientModal from "./PatientModal";

const { ipcRenderer } = window.require("electron");

function Home() {
  const [patients, setPatients] = useState(null);
  const [modal, setmodal] = useState(null);

  useEffect(() => {
    if (patients === null) {
      loadPatients();
    }
  }, [patients]);

  const loadPatients = () => {
    ipcRenderer.invoke("patients", "all").then((res) => {
      setPatients([...res]);
    });
  };

  const openPatientModal = (id) =>
    setmodal(<PatientModal id={id} closeModal={closeModal} />);
  const closeModal = (e) => {
    if (e && !e.target.getAttribute("data-closemodal")) {
      return;
    }
    setmodal(null);
    loadPatients();
  };

  return (
    <div className="Home">
      <div className="patients">
        {patients !== null &&
          patients.length > 0 &&
          patients.map((p, i) => (
            <div
              className="patient"
              key={i}
              onClick={() => openPatientModal(p.id)}
            >
              <div className="picture">
                <img
                  src={
                    !p.image
                      ? `file://static/images/no-image.jpg`
                      : `file://static/images/${p.image}`
                  }
                  alt={p.name}
                />
              </div>
              <div className="info">
                <h4>{p.name}</h4>
                <p className="document">{p.document}</p>
              </div>
            </div>
          ))}
        {patients !== null && patients.length <= 0 && (
          <p className="no-patients">No patients.</p>
        )}
      </div>
      {modal !== null && modal}
    </div>
  );
}

export default Home;
