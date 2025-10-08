import React from "react";

interface MenuIconProps {
  onClick: () => void;
}

export const MenuIcon: React.FC<MenuIconProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="h-8 w-8 flex items-center justify-center bg-white text-emerald-600 rounded-full font-bold shadow"
    >
      U
    </button>
  );
};
