import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // Backend URL from environment variables
});

// Request Interceptor: Add Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("Authorization");
  const userID = localStorage.getItem("UserID");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (userID) {
    config.headers.UserID = userID;
  }
  return config;
});

// Response Interceptor: Handle token updates
api.interceptors.response.use((response) => {
  console.log(
    "response.headers[Authorization]",
    response.headers["authorization"]
  );
  // Check if the backend sent updated tokens in the headers
  const authorization = response.headers["authorization"];
  const spotifyToken = response.headers["spotifyauthorization"];
  const userID = response.headers["userid"];

  if (authorization) {
    localStorage.setItem("Authorization", authorization);
  }
  if (spotifyToken) {
    localStorage.setItem("SpotifyAuthorization", spotifyToken);
  }
  if (userID) {
    localStorage.setItem("UserID", userID);
  }

  return response; // Return the response for further processing
});

// Fetch genres
export const fetchGenres = async (config = {}) => {
  const response = api.get("/genres", config);
  return response; // Return the genres data
};

// Fetch user details
export const fetchUser = async (config = {}) => {
  const response = api.get("/me", config);
  return response; // Return the user data
};

// Update user genres
export const updateUserGenres = async (
  updatedGenres: string[],
  config = {}
) => {
  const response = api.patch("/me", { genres: updatedGenres }, config);
  return response; // Return the updated user data
};

// Toggle track like status
export const toggleTrackLike = async (
  trackId: string,
  liked: boolean,
  config = {}
) => {
  const response = api.put(
    `/tracks/${trackId}/like?liked=${liked}`,
    {},
    config
  );
  return response; // Return the updated track data
};

// Activate player
export const activatePlayer = async (deviceId: string, config = {}) => {
  const response = api.get(
    `/player?action=activate&device_id=${deviceId}`,
    config
  );
  return response; // Return the player activation response
};

// Fetch sets
export const fetchSets = async (config = {}) => {
  const response = api.get("/sets", config);
  return response; // Return the sets data
};

// Play a track on the player
export const playTrack = async (
  deviceId: string,
  uris: string,
  config = {}
) => {
  const response = api.get(
    `/player?action=play&device_id=${deviceId}&uris=${uris}`,
    config
  );
  return response; // Return the response data
};

// login
export const login = async (username: string, password: string) => {
  const response = api.post(
    "/login",
    { username, password },
    {
      withCredentials: true,
    }
  );
  return response; // Return the login response data
};

// signup
export const signup = async (
  username: string,
  password: string,
  genres: string[]
) => {
  const response = api.post("/signup", { username, password, genres });
  return response; // Return the signup response data
};

export const fetchLeaderboard = async () => {
  const response = api.get(
    "/leaderboard",
    { withCredentials: true } // Include credentials in the request
  );
  return response; // Return the signup response data
};

export default api;
