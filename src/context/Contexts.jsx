import AuthProvider from "./Providers/AuthProvider";
import UserProvider from "./Providers/UserProvider";

const Contexts = ({ children }) => {
  return (
    <AuthProvider>
      <UserProvider>{children}</UserProvider>
    </AuthProvider>
  );
};

export default Contexts;
