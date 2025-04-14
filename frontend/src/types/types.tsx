export interface Track {
  id: string;
  uri: string;
  name: string;
  artist: string;
  liked: boolean;
  likes: number;
  img_url: string;
}
export interface Set {
  id: string;
  link: string;
  tracks: Track[];
  active?: boolean;
  username: string;
  profilePicURL?: string;
}

export interface PlayerState {
  track_window: {
    current_track: {
      id: string;
      name: string;
      artists: { name: string }[];
    };
  };
  paused: boolean;
  position: number;
  duration: number;
}
