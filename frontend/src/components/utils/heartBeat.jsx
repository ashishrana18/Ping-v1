import React, { useContext, useEffect } from "react";
import socket from "../../services/socket.js";
import { AuthContext } from "../../services/authContext.jsx";

function Heartbeat() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user && user.id) {
      const intervalId = setInterval(() => {
        socket.emit("userOnline", { userId: user.id });
      }, 10000);

      return () => clearInterval(intervalId);
    }
  }, [user]);

  return null;
}

export default Heartbeat;
