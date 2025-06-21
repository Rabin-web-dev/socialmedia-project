import React from "react";
import ReactDOM from "react-dom/client";
// import AppRoutes from "./routes/AppRoutes";
import "./index.css";
import App from "./App"
import { Provider } from "react-redux";
import { store } from "./redux/store"; 
import { SocketProvider } from "./context/SocketProvider";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
  <Provider store={store}>
    <SocketProvider>
      <App/>
    </SocketProvider>
  </Provider>
</React.StrictMode>
);
