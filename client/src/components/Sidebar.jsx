import React, { useContext, useEffect, useState, useRef } from 'react';
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();
  const {
    getRecentChats,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  } = useContext(ChatContext);

  const { logout, axios, onlineUsers, authUser } = useContext(AuthContext);
  const [input, setInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showOnline, setShowOnline] = useState(false);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!input.trim()) {
        setSearchResults([]);
        return;
      }
      try {
        const { data } = await axios.get(`/api/messages/users?search=${encodeURIComponent(input)}`);
        if (data.success) {
          setSearchResults(data.users);
        }
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      }
    };
    fetchSearchResults();
  }, [input, axios]);

  // Show recent chats or search results
  const filteredUsers = !input.trim()
    ? (showOnline
        ? users.filter(user => onlineUsers.includes(user._id) && user._id !== authUser._id)
        : users)
    : searchResults;

  // Handle user click
  const handleUserClick = (user) => {
    setSelectedUser(user);
    setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
    if (input.trim()) setInput('');
  };

  useEffect(() => {
    getRecentChats();
  }, []);

  return (
    <div
      className={`bg-white h-full p-5 overflow-y-scroll text-black border-r border-gray-300 ${
        selectedUser ? 'max-md:hidden' : ''
      }`}
    >
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="max-w-40" />
          {/* Toggle for online/recent */}
          <button
            className={`ml-3 px-3 py-1 rounded-full text-xs font-medium border ${showOnline ? 'bg-violet-100 text-violet-700 border-violet-300' : 'bg-gray-100 text-gray-700 border-gray-300'} transition`}
            onClick={() => setShowOnline((prev) => !prev)}
            title={showOnline ? 'Show Recent Chats' : 'Show Online Users'}
          >
            {showOnline ? 'Recent Chats' : 'Online Users'}
          </button>
          {/* Menu icon and dropdown */}
          <div className="relative py-2" ref={menuRef}>
            <img
              src={assets.menu_icon}
              alt="Menu"
              className="max-h-5 cursor-pointer"
              onClick={() => setMenuOpen((prev) => !prev)}
            />
            {menuOpen && (
              <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-white border border-gray-300 text-black">
                <p
                  onClick={() => {
                    navigate('/profile');
                    setMenuOpen(false);
                  }}
                  className="cursor-pointer text-sm"
                >
                  Edit Profile
                </p>
                <hr className="my-2 border-t border-gray-200" />
                <p
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="cursor-pointer text-sm"
                >
                  Logout
                </p>
              </div>
            )}
          </div>
        </div>
        {/* Search input */}
        <div className="bg-gray-100 rounded-full flex items-center gap-2 py-3 px-4 mt-5">
          <img src={assets.search_icon} alt="Search" className="w-3" />
          <input
            onChange={(e) => setInput(e.target.value)}
            type="text"
            className="bg-transparent border-none outline-none text-black text-xs placeholder-gray-500 flex-1"
            placeholder="Search User..."
          />
        </div>
      </div>

      <div className="flex flex-col">
        {filteredUsers.length === 0 && input.trim() && (
          <div className="text-center text-gray-400 py-4">No users found</div>
        )}
        {filteredUsers.map((user) => (
          <div
            onClick={() => handleUserClick(user)}
            key={user._id}
            className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${
              selectedUser?._id === user._id && 'bg-gray-200'
            }`}
          >
            <img
              src={user?.profilePic || assets.avatar_icon}
              alt=""
              className="w-[35px] aspect-[1/1] rounded-full"
            />
            <div className="flex flex-col leading-5">
              <span className="font-medium text-black text-sm">
                {user.fullName}
              </span>
              {onlineUsers.includes(user._id) ? (
                <span className="text-green-500 text-xs">Online</span>
              ) : (
                <span className="text-gray-400 text-xs">Offline</span>
              )}
            </div>
            {unseenMessages[user._id] > 0 && (
              <span className="ml-auto bg-blue-500 text-white text-xs rounded-full px-2">
                {unseenMessages[user._id]}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
