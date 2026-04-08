"use client";

import { useState, useRef, FormEvent } from "react";
import { apiClient, setAccessToken } from "@/lib/api"; // Adjust path as needed

interface SignupFormProps {
  onGoToLogin: () => void;
}

export default function Signup({ onGoToLogin }: SignupFormProps) {
  // Navigation State
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Data State
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [details, setDetails] = useState({
    firstName: "",
    lastName: "",
    password: "",
    middle_name: "",
    confirmPassword: "",
  });

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ----------------------------------------
  // STEP 1: Initiate Signup
  // ----------------------------------------
  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.publicPost(
        "/api/v1/biskota/auth/signup",
        email,
      );

      if (data.status_code === 202) {
        setStep(2); // OTP sent
      } else if (data.status_code === 200) {
        setStep(3); // Email already verified
      }
    } catch (err: any) {
      // Intercept the specific OTP error from the backend
      if (err.message === "Your code is not expired yet.") {
        setError(err.message); // Clear the error state so it doesn't show in red
        setStep(2); // Proceed to the OTP input step
      } else {
        // Handle all other actual errors
        setError(err.message || "Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------
  // STEP 2: Verify OTP
  // ----------------------------------------
  const handleOtpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Sends the OTP string directly, matching FastAPI: otp_code: str = Body()
      const data = await apiClient.post(
        "/api/v1/biskota/auth/verify-otp",
        otpString,
      );

      // Backend returns status_code 201 Created on success
      if (data.status_code === 201) {
        setStep(3);
      }
    } catch (err: any) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // ----------------------------------------
  // STEP 3: Complete Signup
  // ----------------------------------------
  const handleDetailsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (details.password !== details.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Mapping frontend camelCase to standard backend snake_case
      // Modify these keys if your FastAPI SignUpRequest model uses different names
      const payload = {
        first_name: details.firstName,
        last_name: details.lastName,
        password: details.password,
      };

      const data = await apiClient.publicPost(
        "/api/v1/biskota/auth/complete-signup",
        payload,
      );

      if (data.status_code === 201) {
        // Save the access token returned by the backend into our apiClient memory
        if (data.access_token) {
          setAccessToken(data.access_token);
        }

        setStep(4);
      }
    } catch (err: any) {
      setError(err.message || "Could not complete signup.");
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------
  // RENDERER
  // ----------------------------------------
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-[#0B1221] mb-1">
                Create an account
              </h1>
              <p className="text-gray-400 text-sm">
                Let's get started by verifying your email.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-[#8a0606] text-xs rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <form className="flex flex-col gap-4" onSubmit={handleEmailSubmit}>
              <div className="flex flex-col">
                <label
                  htmlFor="signup-email"
                  className="text-xs font-semibold text-[#0B1221] mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="signup-email"
                    placeholder="hello@biskota.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 bg-white text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8a0606] focus:ring-1 focus:ring-[#8a0606] text-sm transition-all placeholder:text-gray-400 disabled:bg-gray-100"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#8a0606] hover:bg-[#660000] text-white font-semibold py-2.5 rounded-lg mt-2 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? "Processing..." : "Continue"}
                {!isLoading && (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    ></path>
                  </svg>
                )}
              </button>
            </form>
            <p className="text-center text-xs text-[#0B1221] font-semibold mt-8">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onGoToLogin}
                className="text-[#8a0606] hover:underline"
              >
                Log in
              </button>
            </p>
          </>
        );

      case 2:
        return (
          <div className="relative">
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
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
            </button>
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-[#0B1221] mb-1">
                Verify Email
              </h1>
              <p className="text-gray-400 text-sm">
                We sent a 6-digit code to{" "}
                <span className="font-semibold text-gray-700">{email}</span>.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-[#8a0606] text-xs rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <form className="flex flex-col gap-6" onSubmit={handleOtpSubmit}>
              <div className="flex justify-between gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }} // Fixed strict TypeScript ref error
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[i] && i > 0)
                        otpRefs.current[i - 1]?.focus();
                    }}
                    className="w-12 h-12 text-center text-lg font-semibold border border-gray-200 rounded-lg focus:border-[#8a0606] focus:ring-1 focus:ring-[#8a0606] focus:outline-none"
                  />
                ))}
              </div>
              <p className="text-center text-xs text-gray-500 font-semibold">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleEmailSubmit}
                  className="text-[#8a0606] hover:underline"
                >
                  Resend
                </button>
              </p>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#8a0606] hover:bg-[#660000] text-white font-semibold py-2.5 rounded-lg transition-colors text-sm disabled:opacity-70"
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </button>
            </form>
          </div>
        );

      case 3:
        return (
          <div className="relative">
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
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
            </button>
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-[#0B1221] mb-1">
                Your Details
              </h1>
              <p className="text-gray-400 text-sm">
                Almost there! Setup your profile and password.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-[#8a0606] text-xs rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <form
              className="flex flex-col gap-4"
              onSubmit={handleDetailsSubmit}
            >
              <div className="flex gap-4">
                <div className="flex flex-col w-1/2">
                  <label className="text-xs font-semibold text-[#0B1221] mb-1.5">
                    First Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={details.firstName}
                      onChange={(e) =>
                        setDetails({ ...details, firstName: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#8a0606] focus:ring-1 focus:ring-[#8a0606] text-sm placeholder:text-gray-400"
                    />
                  </div>
                </div>
                <div className="flex flex-col w-1/2">
                  <label className="text-xs font-semibold text-[#0B1221] mb-1.5">
                    Last Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={details.lastName}
                      onChange={(e) =>
                        setDetails({ ...details, lastName: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#8a0606] focus:ring-1 focus:ring-[#8a0606] text-sm placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-[#0B1221] mb-1.5">
                  Create Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Password"
                    value={details.password}
                    onChange={(e) =>
                      setDetails({ ...details, password: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#8a0606] focus:ring-1 focus:ring-[#8a0606] text-sm placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-[#0B1221] mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={details.confirmPassword}
                    onChange={(e) =>
                      setDetails({
                        ...details,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#8a0606] focus:ring-1 focus:ring-[#8a0606] text-sm placeholder:text-gray-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#8a0606] hover:bg-[#660000] text-white font-semibold py-2.5 rounded-lg mt-2 transition-colors text-sm disabled:opacity-70"
              >
                {isLoading ? "Creating..." : "Create Account"}
              </button>
            </form>
          </div>
        );

      case 4:
        return (
          <div className="flex flex-col items-center text-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-[#faecec] rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-[#8a0606]"
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
            <h1 className="text-2xl font-bold text-[#0B1221] mb-2">
              All Done!
            </h1>
            <p className="text-gray-400 text-sm mb-8 px-4">
              Your Biskota account has been created successfully.
            </p>
            <button
              onClick={onGoToLogin}
              className="w-full bg-[#8a0606] hover:bg-[#660000] text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              Proceed to Dashboard
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return <div className="flex flex-col h-auto w-full">{renderStep()}</div>;
}
