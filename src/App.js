import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { routes } from "./routes";
import "./App.css";
import { Helmet } from "react-helmet";

function App() {
  const getComponent = (component) => {
    return React.createElement(component, {});
  };
  return (
    <div className="App">
      <Helmet>
        <title> Mealprep | Prepare Your Desire Meals </title>
      </Helmet>
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
