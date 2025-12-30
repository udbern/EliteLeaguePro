import { Link } from "react-router-dom";
import LogoS from "../assets/logo.png";

const Logo = () => {
  return (
    <Link
      to="/"
      className="flex items-center space-x-2"
    >
      <div className="relative w-10 h-10  rounded-lg flex items-center justify-center">
        <img
          src={LogoS}
          alt="Elite League Logo"
          width={60}
          height={60}
          className="object-cover object-center"
        />
      </div>

      <div className="flex flex-col w-full md:w-auto">
        <span className="text-lg sm:text-xl md:text-2xl font-bold bg-primary bg-clip-text text-transparent">
          Elite League
        </span>
        <p className="text-[12px] md:text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent  uppercase opacity-75 text-left">
          Nigeria
        </p>
      </div>
    </Link>
  );
};

export default Logo;
