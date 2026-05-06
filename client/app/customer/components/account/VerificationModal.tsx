"use client";

import React, { useState, useRef, FormEvent, useEffect } from "react";
import { apiClient } from "@/lib/api";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "forgot-password" | "change-email";
}

export default function VerificationModal({
  isOpen,
  onClose,
  mode,
}: VerificationModalProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newValue, setNewValue] = useState("");
  const [confirmValue, setConfirmValue] = useState("");

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setOtp(["", "", "", "", "", ""]);
      setNewValue("");
      setConfirmValue("");
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  // --- DYNAMIC CONFIGURATION ---
  const config = {
    "forgot-password": {
      title1: "Reset Password",
      desc1:
        "Click below to send a secure password reset code to your registered email address.",
      title3: "Create New Password",
      desc3: "Enter your new secure password below.",
      inputType: "password",
      inputLabel: "New Password",
      confirmLabel: "Confirm New Password",
      placeholder: "At least 8 characters",
      finalSuccess: "Your password has been successfully updated.",
      apiSendCode: "/me/initiate-password-reset",
      apiVerifyCode: "/me/verify-otp",
      apiFinal: "/me/forgot-password",
      payloadKey: "new_password",
    },
    "change-email": {
      title1: "Change Email",
      desc1:
        "Click below to send a verification code to your current registered email address.",
      title3: "Enter New Email",
      desc3: "What is your new email address?",
      inputType: "email",
      inputLabel: "New Email Address",
      confirmLabel: "Confirm New Email",
      placeholder: "new@biskota.com",
      finalSuccess: "Your email address has been successfully updated.",
      apiSendCode: "/auth/request-update-otp",
      apiVerifyCode: "/auth/verify-update-otp",
      apiFinal: "/me/change-email",
      payloadKey: "new_email",
    },
  }[mode];

  // --- STEP 1 & RESEND: SEND OTP ---
  const handleSendCode = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const response = await apiClient.post(config.apiSendCode, {});

      // 🚀 NEW: Check if the OTP is already verified (Skip to Step 3)
      if (
        response?.message ===
        "Your OTP is already verified. Please proceed to the final step."
      ) {
        setStep(3);
        return;
      }

      // Default success: Go to OTP step
      setStep(2);

      // If triggered from the Resend button, show a small success message
      if (step === 2) {
        setSuccessMsg("A new code has been sent to your email.");
      }
    } catch (err: any) {
      // 🚀 NEW: Check if the previous code is not expired yet (Skip to Step 2)
      if (err.message === "Your code is not expired yet.") {
        setError(null);
        setStep(2);

        // Optional: Let them know their old code is still active
        if (step === 2) {
          setSuccessMsg(
            "Your previous code is still valid. Please enter it below.",
          );
        }
      } else {
        // Handle actual errors
        setError(err.message || "Failed to send code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- STEP 2: VERIFY OTP ---
  const handleOtpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await apiClient.post(config.apiVerifyCode, otpString);
      setStep(3);
    } catch (err: any) {
      setError(err.message || "Invalid or expired code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  // --- STEP 3: SUBMIT NEW DETAILS ---
  const handleFinalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newValue !== confirmValue) {
      setError(
        `The ${mode === "forgot-password" ? "passwords" : "emails"} do not match.`,
      );
      return;
    }
    if (mode === "forgot-password" && newValue.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await apiClient.patch(config.apiFinal, newValue);
      setStep(4);
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Could not update your details.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDERER ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        {step !== 4 && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full"
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* --- STEP 1 UI (SEND OTP CONFIRMATION) --- */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-[#0B1527] mb-1">
                {config.title1}
              </h2>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                {config.desc1}
              </p>
            </div>
            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <button
              onClick={handleSendCode}
              disabled={isLoading}
              className="w-full bg-[#0B1527] hover:bg-gray-900 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-70 text-sm flex items-center justify-center gap-2"
            >
              {isLoading ? "Checking Status..." : "Send Verification Code"}
            </button>
          </div>
        )}

        {/* --- STEP 2 UI (VERIFY OTP) --- */}
        {step === 2 && (
          <div className="relative animate-in fade-in slide-in-from-right-4 duration-300">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="absolute -left-4 top-1 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-[#0B1527] mb-1">
                Verify Email
              </h2>
              <p className="text-gray-400 text-sm mt-2">
                Enter the 6-digit code we sent to your registered email.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 text-xs rounded-lg border border-green-100">
                {successMsg}
              </div>
            )}

            <form className="flex flex-col gap-6" onSubmit={handleOtpSubmit}>
              <div className="flex justify-between gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[i] && i > 0)
                        otpRefs.current[i - 1]?.focus();
                    }}
                    className="w-12 h-12 text-center text-lg font-semibold border border-gray-200 rounded-lg focus:border-gray-300 focus:ring-1 focus:ring-gray-300 focus:outline-none"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0B1527] hover:bg-gray-900 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-70 text-sm"
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </button>

              <p className="text-center text-xs text-gray-500 font-semibold mt-2">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isLoading}
                  className="text-[#800000] hover:underline disabled:opacity-50 disabled:cursor-not-allowed ml-1"
                >
                  Resend
                </button>
              </p>
            </form>
          </div>
        )}

        {/* --- STEP 3 UI (SUBMIT NEW DETAILS) --- */}
        {step === 3 && (
          <div className="relative animate-in fade-in slide-in-from-right-4 duration-300">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="absolute -left-4 top-1 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-[#0B1527] mb-1">
                {config.title3}
              </h2>
              <p className="text-gray-400 text-sm mt-2">{config.desc3}</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <form className="flex flex-col gap-4" onSubmit={handleFinalSubmit}>
              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-gray-400 tracking-wider mb-2">
                  {config.inputLabel.toUpperCase()}
                </label>
                <input
                  type={config.inputType}
                  placeholder={config.placeholder}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-gray-400 tracking-wider mb-2">
                  {config.confirmLabel.toUpperCase()}
                </label>
                <input
                  type={config.inputType}
                  placeholder={config.placeholder}
                  value={confirmValue}
                  onChange={(e) => setConfirmValue(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0B1527] hover:bg-gray-900 text-white font-semibold py-3 rounded-xl mt-2 transition-all disabled:opacity-70 text-sm"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}

        {/* --- STEP 4 UI (SUCCESS) --- */}
        {step === 4 && (
          <div className="flex flex-col items-center text-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#0B1527] mb-2">Success!</h2>
            <p className="text-gray-500 text-sm mb-8 px-4">
              {config.finalSuccess}
            </p>
            <button
              onClick={onClose}
              className="w-full bg-[#0B1527] hover:bg-gray-900 text-white font-semibold py-3 rounded-xl transition-all text-sm"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
