import SpotifySignup from "./components/ui/SpotifyLogin";
import SetsPage from "./pages/SetsPage";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-800 text-white p-4">
        <SpotifySignup />
      </header>
      <main className="flex-grow flex items-center justify-center">
        <SetsPage />
      </main>
    </div>
  );
}

export default App;
