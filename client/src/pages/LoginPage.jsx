import React, { useContext, useState } from 'react';
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useContext(AuthContext);

  const onSubmitHandler = (event) => {
    event.preventDefault();
    login(currState === "Sign up" ? 'signup' : 'login', { fullName, email, password });
  };

  return (
    <div className='min-h-screen bg-white text-black flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col'>
      {/* Left */}
      <img src={assets.logo_big} alt="Logo" className='w-[min(40vw,520px)]' />

      {/* Right */}
      <form
        onSubmit={onSubmitHandler}
        className='w-[min(90vw,420px)] border border-gray-300 bg-white p-6 flex flex-col gap-6 rounded-lg shadow-md'
      >
        <h2 className='font-medium text-2xl flex justify-between items-center'>
          {currState}
        </h2>

        {currState === "Sign up" ? (
          <>
            <input
              onChange={(e) => setFullName(e.target.value)}
              value={fullName}
              type="text"
              placeholder="Full Name"
              required
              className='p-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400'
            />
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder='Email Address'
              required
              className='p-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400'
            />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder='Password'
              required
              className='p-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400'
            />
          </>
        ) : (
          <>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder='Email Address'
              required
              className='p-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400'
            />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder='Password'
              required
              className='p-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400'
            />
          </>
        )}

        <button type='submit' className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer'>
          {currState === "Sign up" ? "Create Account" : "Login Now"}
        </button>

        <div className='flex flex-col gap-2'>
          {currState === "Sign up" ? (
            <p className='text-sm text-gray-700'>
              Already have an account?{" "}
              <span onClick={() => setCurrState("Login")} className='font-medium text-violet-600 cursor-pointer'>Login here</span>
            </p>
          ) : (
            <p className='text-sm text-gray-700'>
              Create an account{" "}
              <span onClick={() => setCurrState("Sign up")} className='font-medium text-violet-600 cursor-pointer'>Click here</span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
