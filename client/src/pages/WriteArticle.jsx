import { Edit, Sparkles, Lock, AlertCircle } from "lucide-react";
import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

// Add request interceptor for automatic token inclusion
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("quickai_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("quickai_token");
      localStorage.removeItem("quickai_current_user");
      toast.error("Session expired. Please login again.");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const WriteArticle = () => {
  const { getValidToken, logout } = useAuth();
  const navigate = useNavigate();
  const articleLength = [
    { length: 800, text: "Short (500-800 words)" },
    { length: 1200, text: "Medium (800-1200 words)" },
    { length: 1600, text: "Long (1200+ words)" },
  ];

  const [selectedLength, setSelectedLength] = useState(articleLength[0]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    // Check authentication on mount
    const checkAuth = () => {
      const validToken = getValidToken();
      if (!validToken) {
        console.log("WriteArticle: No valid token found");
        setIsAuthChecked(true);
      } else {
        setIsAuthChecked(true);
      }
    };

    // Small delay to ensure AuthContext is loaded
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [getValidToken]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Check authentication before making request
    const validToken = getValidToken();
    if (!validToken) {
      toast.error("Please login to generate articles");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setContent(""); // Clear previous content
      const prompt = `Write an article about ${input} in ${selectedLength.text}`;

      console.log("WriteArticle: Sending request to generate article");
      const { data } = await axios.post(
        "/api/ai/generate-article",
        {
          prompt,
          length: selectedLength.length,
        },
        {
          headers: {
            Authorization: `Bearer ${validToken}`,
          },
        }
      );

      if (data.success) {
        setContent(data.content);
        toast.success("Article generated successfully!");
      } else {
        toast.error(data.message || "Failed to generate article");
      }
    } catch (error) {
      console.error("WriteArticle: Error generating article:", error);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        logout();
        navigate("/login");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message || "Failed to generate article");
      }
    }
    setLoading(false);
  };

  // Show loading while checking auth
  if (!isAuthChecked) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  const validToken = getValidToken();
  if (!validToken) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Login Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please login to generate AI-powered articles. Your articles will be
            saved to your account.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* left col */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#4A7AFF]" />
          <h1 className="text-xl font-semibold">Article Configuration</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Article Topic</p>

        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          placeholder="The future of artificial intelligence is..."
          required
        />

        <p className="mt-4 text-sm font-medium">Article Length</p>

        <div className="mt-3 flex gap-3 flex-wrap sm:max-w-9/11">
          {articleLength.map((item, index) => (
            <span
              onClick={() => setSelectedLength(item)}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${
                selectedLength.text === item.text
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-500 border-gray-300"
              }`}
              key={index}
            >
              {item.text}
            </span>
          ))}
        </div>
        <br />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
              Generating...
            </>
          ) : (
            <>
              <Edit className="w-5" />
              Generate article
            </>
          )}
        </button>
      </form>
      {/* Right col */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]">
        <div className="flex items-center gap-3">
          <Edit className="w-5 h-5 text-[#4A7AFF]" />
          <h1 className="text-xl font-semibold">Generated article</h1>
        </div>

        {!content && !loading ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <Edit className="w-9 h-9" />
              <p>Enter a topic and click "Generate article" to get started</p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Generating your article...</p>
              <p className="text-xs text-gray-400 mt-2">
                This may take a few seconds
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-3 h-full overflow-y-scroll text-sm text-slate-600">
            <div className="reset-tw">
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WriteArticle;
