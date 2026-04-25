
// import { io } from "socket.io-client";

// const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000" ,{
//   withCredentials: true,
//   transports: ["websocket"],
// });

// export default socket;
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.PROD
  ? "https://campusloop-project.onrender.com"
  : "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,            // ⭐ MOST IMPORTANT
  withCredentials: true,
  transports: ["polling","websocket"],     // avoid polling issues on Render
});
