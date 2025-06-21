// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { User } from "lucide-react";
// import { useSelector } from "react-redux";

// const Navbar = () => {
//   const username = JSON.parse(localStorage.getItem("user"))?.username || "guest";
//   const navigate = useNavigate();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [results, setResults] = useState([]);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const { user } = useSelector((state) => state.auth);

//   // Handle typing in search bar
//   const handleSearchChange = async (e) => {
//     const value = e.target.value;
//     setSearchQuery(value);

//     if (value.trim()) {
//       try {
//         const res = await fetch(`http://localhost:5000/api/search/users?q=${value}`);
//         const data = await res.json();
//         setResults(data);
//         setShowDropdown(true);
//       } catch (err) {
//         console.error("Search error:", err);
//         setResults([]);
//       }
//     } else {
//       setShowDropdown(false);
//       setResults([]);
//     }
//   };

//   // Submit search (if Enter is pressed)
//   const handleSearchSubmit = (e) => {
//     e.preventDefault();
//     if (searchQuery.trim()) {
//       navigate(`/search?q=${searchQuery}`);
//       setSearchQuery("");
//       setShowDropdown(false);
//     }
//   };

//   return (
//     <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
//       {/* Logo + App Name */}
//       <div className="flex items-center">
//         <img src="/logo.png" alt="Logo" className="h-10 mr-2" />
//         <Link to="/home" className="text-xl font-bold">SocialApp</Link>
//       </div>

//       {/* Search Bar */}
//       <div className="relative w-72">
//         <form onSubmit={handleSearchSubmit} className="flex items-center bg-white rounded-lg overflow-hidden">
//           <input
//             type="text"
//             value={searchQuery}
//             onChange={handleSearchChange}
//             onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
//             placeholder="Search users or posts..."
//             className="px-4 py-2 w-full text-black outline-none"
//           />
//           <button 
//             type="submit" 
//             className="bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
//           >
//             🔍
//           </button>
//         </form>

//         {/* Dropdown Suggestions */}
//         {showDropdown && results.length > 0 && (
//           <div className="absolute top-full mt-1 w-full bg-white border rounded shadow z-50 text-black max-h-64 overflow-y-auto">
//             {results.map((user) => (
//               <div
//                 key={user._id}
//                 onClick={() => {
//                   setShowDropdown(false);
//                   setSearchQuery("");
//                   navigate(`/profile/${user.username}/${user._id}`);
//                 }}
//                 className="p-2 hover:bg-gray-100 cursor-pointer"
//               >
//                 <p className="font-semibold">@{user.username}</p>
//                 <p className="text-sm text-gray-500">{user.name}</p>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Profile Icon */}
//       <div className="flex gap-4">
//         <Link
//           to={`/profile/${username}`}
//           className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-4 py-2 transition-all duration-200"
//         >
//           <User size={20} />
//           <span className="text-base">{user?.username}</span>
//         </Link>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;


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

  // 🔍 Debounced search handler
  const fetchSearchResults = debounce(async (value) => {
    try {
      const res = await fetch(`http://localhost:5000/api/search/users?q=${value}`);
      const data = await res.json();
      setResults(data);
      setShowDropdown(true);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
      setShowDropdown(false);
    }
  }, 300); // 300ms debounce

  // 🔄 Handle input change
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

  // 🔁 Submit full search query
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
      setSearchQuery("");
      setShowDropdown(false);
    }
  };

  // ⛔ Close dropdown on outside click
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
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      {/* Left Logo */}
      <div className="flex items-center">
        <img src="/logo.png" alt="Logo" className="h-10 mr-2" />
        <Link to="/home" className="text-xl font-bold">SocialApp</Link>
      </div>

      {/* Search Bar */}
      <div className="relative w-72" ref={dropdownRef}>
        <form onSubmit={handleSearchSubmit} className="flex items-center bg-white rounded-lg overflow-hidden">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search users..."
            className="px-4 py-2 w-full text-black outline-none"
          />
          <button type="submit" className="bg-blue-700 px-4 py-2 text-white hover:bg-blue-800">
            🔍
          </button>
        </form>

        {/* 🔽 Search Suggestions */}
        {showDropdown && results.length > 0 && (
          <div className="absolute top-full mt-1 w-full bg-white border rounded shadow z-50 text-black max-h-64 overflow-y-auto">
            {results.map((userResult) => (
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
            ))}
          </div>
        )}
      </div>

      {/* Profile Link */}
      <div className="flex gap-4">
        <Link
          to={`/profile/${user?.username}/${user?._id}`}
          className="flex items-center gap-2 hover:bg-blue-700 rounded-lg px-4 py-2 transition-all duration-200"
        >
          <User size={20} />
          <span className="text-base">{user?.username}</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
