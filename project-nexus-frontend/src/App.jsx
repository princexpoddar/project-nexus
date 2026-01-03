import { useState, useEffect } from "react";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [campuses, setCampuses] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    campusId: "", // Add campusId
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Handle OAuth callback on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const path = window.location.pathname;

    // Handle OAuth success callback
    if (path === "/auth/callback") {
      const token = urlParams.get("token");
      const userParam = urlParams.get("user");

      if (token && userParam) {
        try {
          const userData = JSON.parse(userParam);
          setToken(token);
          setUser(userData);
          localStorage.setItem("token", token);
          localStorage.setItem("user", userParam);
          // Clean up URL
          window.history.replaceState({}, document.title, "/");
        } catch (err) {
          console.error("Error parsing user data:", err);
          setError("Failed to process login data");
        }
      }
    }

    // Handle OAuth error callback
    if (path === "/auth/error") {
      const errorMsg = urlParams.get("error");
      if (errorMsg) {
        setError(errorMsg);
        // Clean up URL
        window.history.replaceState({}, document.title, "/");
      }
    }
  }, []);

  // Fetch campuses on load
  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        const res = await fetch(`${API_URL}/campuses`);
        if (res.ok) {
          const data = await res.json();
          setCampuses(data);
        }
      } catch (err) {
        console.error("Failed to fetch campuses", err);
      }
    };
    fetchCampuses();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      if (isLogin) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        setSuccess("Registration successful! Please login.");
        setIsLogin(true);
        setFormData({ name: "", email: "", password: "", campusId: "" });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  if (user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="bg-white text-black p-8 rounded-lg shadow-lg max-w-md w-full text-center border-2 border-black">
          <h1 className="text-3xl font-bold mb-4">Welcome, {user.name}!</h1>
          <div className="bg-gray-100 p-4 rounded-md mb-6 text-left space-y-2 border border-gray-300">
            <p><span className="text-gray-600 font-medium">Email:</span> {user.email}</p>
            <p><span className="text-gray-600 font-medium">Role:</span> <span className="capitalize">{user.role}</span></p>
            <p><span className="text-gray-600 font-medium">Campus ID:</span> <span className="font-mono text-sm">{user.campusId}</span></p>
          </div>
          <button
            onClick={logout}
            className="w-full bg-black text-white hover:bg-gray-800 font-bold py-2 px-4 rounded transition duration-200 border-2 border-black"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="bg-white text-black p-8 rounded-lg shadow-lg max-w-md w-full border-2 border-black">
        <h2 className="text-3xl font-bold mb-6 text-center">
          {isLogin ? "Login to Nexus" : "Join Nexus"}
        </h2>

        {error && (
          <div className="bg-black text-white border-2 border-black px-4 py-2 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-white text-black border-2 border-black px-4 py-2 rounded mb-4 text-sm text-center">
            {success}
          </div>
        )}

        <div className="mb-6">
          <a
            href={`${API_URL}/auth/google`}
            className="w-full flex items-center justify-center bg-white text-black border-2 border-black hover:bg-gray-100 font-bold py-2 px-4 rounded transition duration-200"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {isLogin ? "Login with Google" : "Sign up with Google"}
          </a>
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-black"></div>
            <span className="flex-shrink-0 mx-4 text-gray-600 text-sm">Or continue with</span>
            <div className="flex-grow border-t border-black"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-black text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Select Campus</label>
                <select
                  name="campusId"
                  value={formData.campusId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-black text-black"
                  required
                >
                  <option value="" disabled>Select your campus</option>
                  {campuses.map(campus => (
                    <option key={campus._id} value={campus._id}>
                      {campus.name}
                    </option>
                  ))}
                </select>
                {formData.campusId && (
                  <p className="text-xs text-gray-600 mt-1">
                    * Must use email ending in @{campuses.find(c => c._id === formData.campusId)?.emailDomain}
                  </p>
                )}
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-black text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-black text-black"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white hover:bg-gray-800 font-bold py-2 px-4 rounded transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4 border-2 border-black"
          >
            {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setSuccess("");
              setFormData({ name: "", email: "", password: "", campusId: "" });
            }}
            className="text-black hover:underline font-medium"
          >
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default App;
