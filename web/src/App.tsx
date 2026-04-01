import { Routes, Route, Outlet } from "react-router";
import { Navbar } from "./components/Navbar";

const Logo = () => (
  <div className="flex items-center font-mono gap-1 font-bold uppercase">
    flow
  </div>
);

function AppLayout() {
  return (
    <>
      <Navbar Logo={Logo} />
      <div className="py-6">
        <Outlet />
      </div>
    </>
  );
}

function HomePage() {
  return <div className="p-6">Home</div>;
}

function LoginPage() {
  return <div className="p-6">Login</div>;
}

function ProfilePage() {
  return <div className="p-6">Profile</div>;
}

function SettingsPage() {
  return <div className="p-6">Settings</div>;
}

function NotFoundPage() {
  return <div className="p-6">404</div>;
}

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
