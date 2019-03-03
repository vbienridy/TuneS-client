import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import LogIn from "./components/LogIn/LogIn";
import Register from "./components/Register/Register";
import Profile from "./components/Profile/Profile";
import User from "./components/User/User";
import Configure from "./components/Configure/Configure";
import Footer from "./components/Layout/Footer";

class RouterBoard extends Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    return (
      <Router>
        <div>
          <Route path="/login" exact component={LogIn} />
          <Route path="/register" exact component={Register} />
          <Route path="/profile" exact component={Profile} />
          <Route path="/user" exact component={User} />
          <Route path="/configure" exact component={Configure} />
          <Footer />
        </div>
      </Router>
    );
  }
}

export default RouterBoard;
