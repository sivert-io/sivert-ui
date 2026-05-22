import { useContext } from "react";
import { InstallAppContext } from "./InstallAppContext";

export function useInstallApp() {
  const context = useContext(InstallAppContext);

  if (!context) {
    throw new Error("useInstallApp must be used within InstallAppProvider");
  }

  return context;
}
