import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { useSelector } from "react-redux";
import debounce from "lodash.debounce";

const Navbar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useSelector((state) => state.auth);

  const fetchSearchResults = debounce(async (value) => {
    try {
      const res = await fetch(`https://stark-socialmedia.onrender.com/api/search/users?q=${value}`);
      const data = await res.json();
      setResults(data);
      setShowDropdown(true);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
      setShowDropdown(false);
    }
  }, 300);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim()) {
      fetchSearchResults(value);
    } else {
      setShowDropdown(false);
      setResults([]);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
      setSearchQuery("");
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-blue-600 text-white p-3 flex items-center justify-between shadow-md fixed top-0 left-0 right-0 z-50">
      
      {/* ✅ Left Section */}
      <div className="flex items-center">
        {/* Desktop/Tablet: Show logo + name */}
        <div className="hidden sm:flex items-center">
          <Link to="/home" className="text-xl font-bold">Stark</Link>
        </div>
        {/* Mobile: Only app name */}
        <div className="flex sm:hidden">
          <Link to="/home" className="text-lg font-bold">Stark</Link>
        </div>
      </div>

      {/* ✅ Center: Search */}
      <div className="flex-1 max-w-xs sm:max-w-md md:max-w-lg px-2" ref={dropdownRef}>
        <form onSubmit={handleSearchSubmit} className="flex items-center bg-white rounded-lg overflow-hidden">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search users..."
            className="px-3 py-1.5 w-full text-black outline-none"
          />
          {/* Desktop/Tablet: Show button */}
          <button type="submit" className="hidden sm:block bg-blue-700 px-3 py-1.5 hover:bg-blue-800">
            🔍
          </button>
        </form>

        {showDropdown && (
          <div className="absolute bg-white text-black mt-1 rounded shadow w-full max-h-64 overflow-y-auto">
            {results.length > 0 ? (
              results.map((userResult) => (
                <div
                  key={userResult._id}
                  onClick={() => {
                    setShowDropdown(false);
                    setSearchQuery("");
                    navigate(`/profile/${userResult.username}/${userResult._id}`);
                  }}
                  className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer"
                >
                  <img
                    src={userResult.profilePic || "/Images/SocialMediaDefaultImage.jpg"}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">@{userResult.username}</p>
                    <p className="text-sm text-gray-500">{userResult.name}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-2 text-gray-500 text-sm">No users found</p>
            )}
          </div>
        )}
      </div>

      {/* ✅ Right Section: Profile */}
      <div>
        <Link
          to={`/profile/${user?.username}/${user?._id}`}
          className="flex items-center gap-2 hover:bg-blue-700 rounded-lg px-3 py-2 transition-all duration-200"
        >
          <User size={22} />
          {/* Desktop/Tablet: Username */}
          <span className="hidden sm:block">{user?.username}</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
