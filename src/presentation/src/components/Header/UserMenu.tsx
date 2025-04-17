import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";

import { FaUserGraduate } from "react-icons/fa6";
import { Link } from "react-router-dom";

interface UserMenuProps {
  role: string;
  handleLogout: () => void;
}

const UserMenu = ({ role, handleLogout }: UserMenuProps) => {
  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<FaUserGraduate size={28} className="text-slate-700" />}
        variant="link"
      />
      <MenuList>
        <Link to="/user-profile">
          <MenuItem>Profile</MenuItem>
        </Link>
        <Link to="student-dashboard">
          <MenuItem>Student Dashboard</MenuItem>
        </Link>
        {role === "admin" && (
          <>
            <Link to="/admin">
              <MenuItem>Admin Dashboard</MenuItem>
            </Link>
            <Link to="/creator">
              <MenuItem>Creator Dashboard</MenuItem>
            </Link>
          </>
        )}
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </MenuList>
    </Menu>
  );
};

export default UserMenu;
