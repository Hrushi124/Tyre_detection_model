import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white text-black rounded-2xl shadow-md p-4 mx-4 my-2">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Brand</h1>
        <div className="hidden md:flex space-x-6">
          <Link
            to="/"
            className="px-4 py-2 rounded-lg transition duration-300 hover:bg-black hover:text-white"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="px-4 py-2 rounded-lg transition duration-300 hover:bg-black hover:text-white"
          >
            About
          </Link>
          <Link
            to="/products"
            className="px-4 py-2 rounded-lg transition duration-300 hover:bg-black hover:text-white"
          >
            Products
          </Link>
          <Link
            to="/contact"
            className="px-4 py-2 rounded-lg transition duration-300 hover:bg-black hover:text-white"
          >
            Contact
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden flex flex-col space-y-2 mt-4">
          <Link
            to="/"
            className="px-4 py-2 rounded-lg transition duration-300 hover:bg-black hover:text-white"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="px-4 py-2 rounded-lg transition duration-300 hover:bg-black hover:text-white"
          >
            About
          </Link>
          <Link
            to="/products"
            className="px-4 py-2 rounded-lg transition duration-300 hover:bg-black hover:text-white"
          >
            Products
          </Link>
          <Link
            to="/contact"
            className="px-4 py-2 rounded-lg transition duration-300 hover:bg-black hover:text-white"
          >
            Contact
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
