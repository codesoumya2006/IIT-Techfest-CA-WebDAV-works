// Generate stars
document.addEventListener('DOMContentLoaded', () => {
  const starsContainer = document.getElementById('stars');
  const starCount = 100;

  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    const size = Math.random() * 3 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.setProperty('--duration', `${Math.random() * 2 + 1}s`);
    starsContainer.appendChild(star);
  }
});

// Modal logic
document.getElementById('reserveBtn').addEventListener('click', () => {
  document.getElementById('reserveModal').classList.add('active');
});
function closeModal() {
  document.getElementById('reserveModal').classList.remove('active');
}

// Theme toggle
function toggleTheme() {
  document.body.classList.toggle('light-mode');
  const icon = document.getElementById('themeIcon');
  icon.textContent = document.body.classList.contains('light-mode') ? '🌙' : '☀️';
}
