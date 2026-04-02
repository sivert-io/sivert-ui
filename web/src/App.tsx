import { Routes, Route, Outlet } from "react-router";
import { Navbar } from "./components/Navbar";
import { SettingsView } from "./views/SettingsView";
import { ProfileView } from "./views/ProfileView";
import { LoginView } from "./views/LoginView";
import { NotFoundView } from "./views/NotFoundView";
import { FrontPageView } from "./views/FrontPageView";

const Logo = () => <img className="h-4" src="/flow.svg" />;

function AppLayout() {
  return (
    <>
      <Navbar Logo={Logo} isInQueue={false} />
      <div className="py-24 max-w-7xl w-full mx-auto">
        <Outlet />
      </div>
    </>
  );
}

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<FrontPageView />} />
        <Route path="/login" element={<LoginView />} />
        <Route path="/profile" element={<ProfileView />} />
        <Route path="/profile/:steamId" element={<ProfileView />} />
        <Route path="/settings" element={<SettingsView />} />
        <Route path="*" element={<NotFoundView />} />
      </Route>
    </Routes>
  );
}
