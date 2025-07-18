import React, { useContext, useEffect, useRef, useState } from 'react';
import assets from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  } = useContext(ChatContext);

  const { logout, onlineUsers } = useContext(AuthContext);
  const [input, setInput] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef();

  const filteredUsers = input
  ? users.filter((user) => {
      const nameMatch = user.fullName?.toLowerCase().includes(input.toLowerCase());
      const emailMatch = user.email?.toLowerCase().includes(input.toLowerCase());
      return nameMatch || emailMatch;
    })
  : users;


  useEffect(() => {
    getUsers();
  }, [onlineUsers]);

  return (
    <div
      className={`bg-white h-full p-5 overflow-y-scroll text-black border-r border-gray-300 ${
        selectedUser ? 'max-md:hidden' : ''
      }`}
    >
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="max-w-40" />

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

      {/* User list */}
      <div className="flex flex-col">
        {filteredUsers.map((user, index) => (
          <div
            onClick={() => {
              setSelectedUser(user);
              setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
            }}
            key={index}
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
              <p>{user.fullName}</p>
              {onlineUsers.includes(user._id) ? (
                <span className="text-green-500 text-xs">Online</span>
              ) : (
                <span className="text-gray-400 text-xs">Offline</span>
              )}
            </div>
            {unseenMessages[user._id] > 0 && (
              <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-blue-500 text-white">
                {unseenMessages[user._id]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
