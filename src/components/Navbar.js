import logo from "../static/icons/heartpulses.svg";
import { Link, useHistory } from "react-router-dom";

function Navbar() {
  let history = useHistory();
  return (
    <nav className="navbar">
      <div className="container">
        <h1 onClick={() => history.push("/")}>
          <img src={logo} alt="MedicalPlus" /> MedicalPlus
        </h1>
        <Link to="/create">Create Patient</Link>
      </div>
    </nav>
  );
}

export default Navbar;
