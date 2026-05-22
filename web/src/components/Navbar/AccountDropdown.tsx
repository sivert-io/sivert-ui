import { MdBadge, MdDns, MdLogout, MdSettings } from "react-icons/md";
import { useNavigate } from "react-router";
import { Button } from "../Button";
import { Divider } from "../Divider/Divider";
import { HoverDropdown } from "../Dropdown";
import { useAuth } from "../../auth/useAuth";
import type { NavbarDropdownPlacement } from "./types";
import { DropdownLink } from "./DropdownLink";

interface AccountDropdownProps {
  placement: NavbarDropdownPlacement;
}

export function AccountDropdown({ placement }: AccountDropdownProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    navigate("/");
    await signOut();
  }

  return (
    <HoverDropdown
      placement={placement}
      dropdownClassName="w-[min(14rem,calc(100vw-1rem))]"
      trigger={
        <Button variant="ghost" aria-label="Open account menu">
          {user?.avatarSmall ? (
            <img
              src={user.avatarSmall}
              alt={user.personaName ?? "User avatar"}
              className="size-6 rounded-full"
            />
          ) : null}
        </Button>
      }
    >
      <DropdownLink
        to={user?.steamId ? `/profile/${user.steamId}` : "/profile"}
        icon={<MdBadge size={18} />}
      >
        My profile
      </DropdownLink>

      <DropdownLink to="/settings" icon={<MdSettings size={18} />}>
        Settings
      </DropdownLink>

      <Divider className="border-primary/20" />

      {!user?.hostStatus ? (
        <DropdownLink to="/host" icon={<MdDns size={18} />}>
          Host a server
        </DropdownLink>
      ) : (
        <DropdownLink to="/servers" icon={<MdDns size={18} />}>
          My servers
        </DropdownLink>
      )}

      <Divider className="border-primary/20" />

      <button
        onClick={handleSignOut}
        className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm text-danger transition hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
      >
        <span className="grid size-5 place-items-center">
          <MdLogout size={18} />
        </span>
        <span>Sign out</span>
      </button>
    </HoverDropdown>
  );
}
