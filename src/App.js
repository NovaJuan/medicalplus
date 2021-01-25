import { Route, Switch } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import CreatePatient from "./components/CreatePatient";

function App() {
  return (
    <div className="App">
      <Navbar />
      <div className="container">
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/create" component={CreatePatient} />
        </Switch>
      </div>
    </div>
  );
}

export default App;
