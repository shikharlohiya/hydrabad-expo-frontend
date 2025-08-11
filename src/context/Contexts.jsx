import AuthProvider from "./Providers/AuthProvider";
import UserProvider from "./Providers/UserProvider";
import SocketProvider from "./Providers/SocketProvider";

const Contexts = ({ children }) => {
  return (
    <UserProvider>
      <AuthProvider>
        <SocketProvider>{children}</SocketProvider>
      </AuthProvider>
    </UserProvider>
  );
};

export default Contexts;
