import { Routes, Route, Outlet, Navigate } from "react-router";
import { Navbar } from "./components/Navbar";
import { useAuth } from "./auth/useAuth";

const Logo = () => (
  <div className="flex items-center gap-1 font-mono font-bold uppercase">
    flow
  </div>
);

function AppLayout() {
  return (
    <>
      <Navbar Logo={Logo} />
      <div className="py-24">
        <Outlet />
      </div>
    </>
  );
}

function HomePage() {
  const { user, isSignedIn, isLoading } = useAuth();

  return (
    <div className="p-6">
      <div className="mx-auto max-w-lg rounded-3xl border border-lavender/20 bg-black/10 p-6">
        <h1 className="mb-2 text-2xl font-bold">Home</h1>
        {isLoading ? (
          <p>Checking session...</p>
        ) : isSignedIn ? (
          <p>Signed in as {user?.personaName ?? user?.steamId}</p>
        ) : (
          <p>Not signed in</p>
        )}
      </div>
    </div>
  );
}

function LoginPage() {
  const { isSignedIn, signIn } = useAuth();

  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-lg rounded-3xl border border-lavender/20 bg-black/10 p-6">
        <h1 className="mb-4 text-2xl font-bold">Login</h1>
        <button
          onClick={signIn}
          className="rounded-full bg-lavender px-4 py-2 text-black transition hover:opacity-90"
        >
          Sign in with Steam
        </button>
      </div>
    </div>
  );
}

function ProfilePage() {
  const { user, isSignedIn, isLoading } = useAuth();

  if (!isLoading && !isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-lg rounded-3xl border border-lavender/20 bg-black/10 p-6">
        <h1 className="mb-4 text-2xl font-bold">Profile</h1>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-2">
            <p>Name: {user?.personaName ?? "-"}</p>
            <p>Steam ID: {user?.steamId ?? "-"}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsPage() {
  const { isSignedIn, isLoading } = useAuth();

  if (!isLoading && !isSignedIn) {
    return <Navigate to="/login" replace />;
  }

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
