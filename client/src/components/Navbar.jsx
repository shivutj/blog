import React from "react";
import { assets } from "../assets/assets";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowRight } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="fixed z-5 w-full backdrop-blur-2xl flex justify-between items-center py-3 px-4 sm:px-20 xl:px-32">
      <img
        src={assets.logo}
        alt="logo"
        className="w-32 sm:w-44 cursor-pointer"
        onClick={() => navigate("/")}
      />

      {user ? (
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600 hidden sm:block">
            {user.name}
          </span>
          <button
            onClick={logout}
            className="text-sm cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm text-slate-600 hover:text-primary transition"
          >
            Login
          </Link>
          <button
            onClick={() => navigate("/signup")}
            className="flex items-center gap-2 rounded-full text-sm cursor-pointer bg-primary text-white px-10 py-2.5"
          >
            Get started <ArrowRight className="w-4 h-4" />{" "}
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
