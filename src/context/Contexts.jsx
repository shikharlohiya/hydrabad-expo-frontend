import AuthProvider from "./Providers/AuthProvider";
import UserProvider from "./Providers/UserProvider";
import DialerProvider from "./Providers/DialerProvider";

const Contexts = ({ children }) => {
    return (
        <AuthProvider>
            <UserProvider>
                <DialerProvider>
                    {children}
                </DialerProvider>
            </UserProvider>
        </AuthProvider>
    );
};

export default Contexts;