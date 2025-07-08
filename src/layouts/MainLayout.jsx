import { Outlet } from 'react-router-dom';

const MainLayout = () => (
  <div className="min-h-screen">
    <main className="">
      <Outlet />
    </main>
  </div>
);

export default MainLayout;
