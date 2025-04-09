import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // Backend URL from environment variables
});

// Request Interceptor: Add Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("Authorization");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle token updates
api.interceptors.response.use(
  (response) => {
    // Check if the backend sent updated tokens
    const { authorization, spotifyToken, userID } = response.data || {};
    if (authorization) {
      localStorage.setItem("Authorization", authorization);
    }
    if (spotifyToken) {
      localStorage.setItem("SpotifyAuthorization", spotifyToken);
    }
    if (userID) {
      localStorage.setItem("UserID", userID);
    }
    return response;
  },
  (error) => {
    // Handle errors (e.g., token expiration, unauthorized access)
    if (error.response?.status === 401) {
      console.error("Unauthorized! Redirecting to login...");
      localStorage.removeItem("Authorization");
      localStorage.removeItem("SpotifyAuthorization");
      localStorage.removeItem("UserID");
      window.location.href = "/login"; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

// Fetch genres
export const fetchGenres = async (config = {}) => {
  const response = await api.get("/genres", config);
  return response.data; // Return the genres data
};

// Fetch user details
export const fetchUser = async (config = {}) => {
  const response = await api.get("/me", config);
  return response; // Return the user data
};

// Update user genres
export const updateUserGenres = async (
  updatedGenres: string[],
  config = {}
) => {
  const response = await api.patch("/me", { genres: updatedGenres }, config);
  return response.data; // Return the updated user data
};

// Toggle track like status
export const toggleTrackLike = async (
  trackId: string,
  liked: boolean,
  config = {}
) => {
  const response = await api.put(
    `/tracks/${trackId}/like?liked=${liked}`,
    {},
    config
  );
  return response.data; // Return the updated track data
};

// Activate player
export const activatePlayer = async (deviceId: string, config = {}) => {
  const response = await api.get(
    `/player?action=activate&device_id=${deviceId}`,
    config
  );
  return response.data; // Return the player activation response
};

// Fetch sets
export const fetchSets = async (config = {}) => {
  const response = await api.get("/sets", config);
  return response; // Return the sets data
};

// Play a track on the player
export const playTrack = async (
  deviceId: string,
  uris: string,
  config = {}
) => {
  const response = await api.get(
    `/player?action=play&device_id=${deviceId}&uris=${uris}`,
    config
  );
  return response.data; // Return the response data
};

export default api;
