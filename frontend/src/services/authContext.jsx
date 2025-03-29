import { createContext, useEffect, useState } from "react";
import api from "../services/api.js";
import { ApiError } from "../../../backend/src/utils/ApiError.js";

export const AuthContext = createContext();

// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      api
        .get("/user/profile")
        .then((response) => {
          if (response.data && response.data.data) {
            setUser(response.data.data);
            console.log("User fetched:", response.data);
          }
        })
        .catch((error) => {
          setUser(null);
          throw new ApiError(400, "User not fetched!", error);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user, setUser]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
