// Animate star positions
function updateStarPositions() {
  document.documentElement.style.setProperty(
    "--star-x",
    Math.random() * 100 + "%"
  );
  document.documentElement.style.setProperty(
    "--star-y",
    Math.random() * 100 + "%"
  );
}

// Initial position
updateStarPositions();

// Update positions periodically
setInterval(updateStarPositions, 100);
