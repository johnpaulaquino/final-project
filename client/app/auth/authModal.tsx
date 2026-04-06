"use client";

import { useEffect, useState } from "react";
import LoginForm from "./login";
import SignupForm from "./signup";
import ForgotPasswordForm from "./forgotPassword";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "login" | "signup" | "forgot-password";
}

export default function AuthModal({
  isOpen,
  onClose,
  initialView = "login",
}: AuthModalProps) {
  const [currentView, setCurrentView] = useState<
    "login" | "signup" | "forgot-password"
  >(initialView);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
      setCurrentView(initialView);
    } else {
      document.body.classList.remove("overflow-hidden");
      setTimeout(() => setCurrentView(initialView), 300);
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex bg-black/60 backdrop-blur-sm items-center justify-center p-4">
      {/* modal container */}
      <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-2xl flex w-full max-w-4xl overflow-hidden min-h-[550px] relative">
        {/* left side*/}
        <div className="w-full md:w-[55%] px-8 py-10 sm:px-12 md:px-14 flex flex-col justify-center items-center">
          <div className="w-full max-w-sm">
            {currentView === "login" && (
              <LoginForm
                onGoToSignup={() => setCurrentView("signup")}
                onGoToForgotPassword={() => setCurrentView("forgot-password")}
              />
            )}

            {currentView === "signup" && (
              <SignupForm onGoToLogin={() => setCurrentView("login")} />
            )}

            {currentView === "forgot-password" && (
              <ForgotPasswordForm onGoToLogin={() => setCurrentView("login")} />
            )}
          </div>
        </div>

        {/* right banner */}
        <div className="hidden md:flex w-[45%] relative bg-[#7a0606] flex-col items-center justify-center p-12 overflow-hidden">
          <img
            src="https://images.pexels.com/photos/15306935/pexels-photo-15306935/free-photo-of-close-up-of-sweet-cakes.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
            alt="Delicious cookie assortment background"
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#4a0000] to-transparent opacity-80"></div>

          <div className="relative z-10 flex flex-col items-center text-center mt-10">
            <h2 className="text-[34px] font-extrabold text-white mb-4 leading-[1.1] tracking-tight">
              Bake the world
              <br />a better place.
            </h2>
            <p className="text-white/90 text-sm font-medium max-w-[250px] leading-relaxed">
              Join Biskota today and discover a community of passionate bakers
              and cookie lovers.
            </p>
          </div>
        </div>
      </div>

      {/* Optional Close Button for the Modal */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white hover:text-gray-300"
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
    </div>
  );
}
