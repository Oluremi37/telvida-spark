import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const VerifyEmail = () => {
  const { token } = useParams();

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email address...");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/verify-email/${token}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Email verification failed.");
        }

        setStatus("success");
        setMessage(
          data.message || "Your email has been verified successfully.",
        );
      } catch (error) {
        setStatus("error");
        setMessage(error.message || "Unable to verify your email.");
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          Email Verification
        </h1>

        <p className="mb-6 text-gray-600">{message}</p>

        {status === "loading" && (
          <div className="animate-pulse text-purple-700">Please wait...</div>
        )}

        {status === "success" && (
          <Link
            to="/login"
            className="inline-block rounded-lg bg-purple-700 px-6 py-3 font-medium text-white hover:bg-purple-800"
          >
            Go to Login
          </Link>
        )}

        {status === "error" && (
          <Link
            to="/signup"
            className="inline-block rounded-lg bg-purple-700 px-6 py-3 font-medium text-white hover:bg-purple-800"
          >
            Back to Sign Up
          </Link>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
