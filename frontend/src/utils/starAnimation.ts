export function initStarAnimation() {
  const updateStarPosition = () => {
    document.documentElement.style.setProperty(
      "--star-x",
      `${Math.random() * 100}%`
    );
    document.documentElement.style.setProperty(
      "--star-y",
      `${Math.random() * 100}%`
    );
  };

  // Initial position
  updateStarPosition();

  // Update position every 100ms
  setInterval(updateStarPosition, 100);
}
