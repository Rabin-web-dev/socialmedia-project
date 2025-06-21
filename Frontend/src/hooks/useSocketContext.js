import { useContext } from "react";
import { SocketContext } from "../context/SocketContext";

const useSocketContext = () => useContext(SocketContext);
export default useSocketContext;
