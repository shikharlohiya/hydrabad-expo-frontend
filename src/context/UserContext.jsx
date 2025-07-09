import { useState, useEffect } from "react";
import { UserContext } from "./Contexts";
export { UserContext } from "./Contexts";

export const UserProvider = ({ children }) => {
    const [userData, setUserData] = useState();

    useEffect(() => {
        // Check for user data in localStorage
        setUserData(JSON.parse(localStorage.getItem("userData")));
    }, []);

    const getUser = () => {
        const data = localStorage.getItem("userData");
        return data ? JSON.parse(data) : null;
    };

    const setUser = (data) => {
        localStorage.setItem("userData", JSON.stringify(data));
        setUserData(data);
    };

    const clearUser = () => {
        localStorage.removeItem("userData");
        setUserData(null);
    };

    return (
        <UserContext.Provider value={{ userData, getUser, setUser, clearUser }}>
            {children}
        </UserContext.Provider>
    );
};