import logo from "./logo.svg";
import React, {useEffect, useState} from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { routes } from "./routes";
import "./App.css";

function App() {
  const getComponent = (component) => {
    return React.createElement(component, {});
  }
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {routes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={getComponent(route.component)}
            />
          ))}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
