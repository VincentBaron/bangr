import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";

const SpotifySignup: FC = () => {
  const [username, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = () => {
    axios
      .post(`${import.meta.env.VITE_BACKEND_URL}/signup`, {
        username: username,
        password,
      })
      .then((response) => {
        window.location.href = response.data.url;
        console.log("response data: ", response.data);
      })
      .catch((error) => {
        console.log("error response data:", error.response.data);
      });
  };

  const handleLogin = () => {
    axios
      .post(
        `${import.meta.env.VITE_BACKEND_URL}/login`,
        { username: username, password },
        { withCredentials: true }
      )
      .then((response) => {
        window.location.reload();
      })
      .catch((error) => {
        console.log("error response data:", error.response.data);
      });
  };

  return (
    <div>
      <input
        type="username"
        value={username}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <Button onClick={handleSignup}>Signup with Spotify</Button>
      <Button onClick={handleLogin}>Login with Spotify</Button>
    </div>
  );
};

export default SpotifySignup;
