import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { BrowserRouter } from "react-router-dom";
import SocketWrapper from "./context/SocketWrapper";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <SocketWrapper>
          <App />
        </SocketWrapper>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);
