import AuthProvider from "./Providers/AuthProvider";
import UserProvider from "./Providers/UserProvider";
import SocketProvider from "./Providers/SocketProvider";
import FormProvider from "./Providers/FormProvider";

const Contexts = ({ children }) => {
  return (
    <AuthProvider>
      <UserProvider>
        <SocketProvider>
          <FormProvider>{children}</FormProvider>
        </SocketProvider>
      </UserProvider>
    </AuthProvider>
  );
};

export default Contexts;
