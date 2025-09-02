import React from "react";
import { useSelector } from "react-redux";
import SocketProvider from "./SocketProvider";

const SocketWrapper = ({ children }) => {
  const auth = useSelector((state) => state.auth);
  const user = auth?.user;

  return <SocketProvider user={user}>{children}</SocketProvider>;
};

export default SocketWrapper;
