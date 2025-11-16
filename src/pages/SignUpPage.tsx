// src/pages/SignUpPage.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FaFacebookF, FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { MdOutlineEmail, MdLockOutline, MdPersonOutline } from "react-icons/md";
import { GiAirplaneDeparture } from "react-icons/gi";

import bg from "../assets/skyhire-bg.png";
import logo from "../assets/skyhire-logo.png";
import flag from "../assets/tunisia-flag.png";
import { authService } from "../services/authService";

const SignUpPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError("");
  try {
    await authService.signUp(email, password, name, role);
    navigate("/"); // Rediriger directement vers le dashboard après inscription
  } catch (err) {
    setError(err instanceof Error ? err.message : "Registration failed");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div
      className="relative flex h-screen w-full bg-cover bg-center font-[Emirates]"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Logo en haut à gauche */}
      <div className="absolute top-6 left-10 flex items-center space-x-3">
        <img src={logo} alt="SkyHire Logo" className="w-24 h-24 object-contain" />
      </div>

      {/* Formulaire d'inscription */}
      <div className="absolute right-20 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-[380px] p-8">
        <div className="text-center mb-6">
          <p className="text-sm font-semibold text-gray-600">
            LET’S GET YOU STARTED
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            Create an account
          </h1>
          <Link
            to="/login"
            className="text-sm text-gray-500 mt-1 cursor-pointer hover:underline"
          >
            I already have an account
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 text-center">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="text-sm font-semibold text-gray-700">Your name</label>
            <div className="flex items-center border border-gray-300 rounded-lg mt-1 px-3">
              <MdPersonOutline className="text-gray-500 text-lg mr-2" />
              <input
                type="text"
                placeholder="John DOE"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-2 outline-none text-gray-700"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <div className="flex items-center border border-gray-300 rounded-lg mt-1 px-3">
              <MdOutlineEmail className="text-gray-500 text-lg mr-2" />
              <input
                type="email"
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-2 outline-none text-gray-700"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <div className="flex items-center border border-gray-300 rounded-lg mt-1 px-3">
              <MdLockOutline className="text-gray-500 text-lg mr-2" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-2 outline-none text-gray-700"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 hover:text-gray-700 ml-2"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="text-sm font-semibold text-gray-700">I am signing up as</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('candidate')}
                className={`rounded-lg border px-3 py-2 font-medium ${role === 'candidate' ? 'border-[#423772] text-[#423772] bg-[#423772]/10' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
              >
                Candidate
              </button>
              <button
                type="button"
                onClick={() => setRole('recruiter')}
                className={`rounded-lg border px-3 py-2 font-medium ${role === 'recruiter' ? 'border-[#423772] text-[#423772] bg-[#423772]/10' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
              >
                Recruiter
              </button>
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center w-full py-2.5 mt-2 bg-gradient-to-r from-purple-700 via-pink-500 to-red-400 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <GiAirplaneDeparture className="mr-2 text-lg" /> Register
              </>
            )}
          </button>

          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Social Buttons */}
          <div className="flex flex-col space-y-3">
            <button
              type="button"
              className="flex items-center justify-center py-2 rounded-lg bg-white text-gray-700 font-semibold border hover:bg-gray-50 shadow-md transition"
            >
              <FcGoogle className="text-2xl mr-2" />
              Register using Google
            </button>

            <button
              type="button"
              className="flex items-center justify-center py-2 rounded-lg bg-[#1877F2] text-white font-semibold shadow-md hover:bg-[#0e63ce] transition"
            >
              <FaFacebookF className="text-lg mr-2" /> Register using Facebook
            </button>

            <button
              type="button"
              className="flex items-center justify-center py-2 rounded-lg bg-black text-white font-semibold shadow-md hover:bg-gray-800 transition"
            >
              <FaApple className="text-xl mr-2" /> Register using Apple
            </button>
          </div>
        </form>
      </div>

      {/* Pied de page avec drapeau et texte */}
      <div className="absolute bottom-6 left-10 flex flex-col items-center space-y-2">
        <img
          src={flag}
          alt="Tunisia Flag"
          className="w-[160px] h-auto object-contain -translate-x-8"
          style={{
            position: "relative",
            left: "-14px"
          }}
        />
        <p className="text-white text-sm font-medium tracking-wide">
          MADE WITH <span className="text-red-500">❤️</span> IN TUNISIA
        </p>
        <p className="text-white text-xs opacity-80">
          SkyHire 2025 © All rights reserved
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
