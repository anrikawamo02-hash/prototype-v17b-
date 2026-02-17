// ===== STABLE FIXED VERSION =====
// rg56 main = 10
// rg56 kitchen = 6
// Fully isolated & no duplication

function getImages(room, category) {
  const images = [];

  if (room === "rg56" && category === "main56") {
    for (let i = 1; i <= 10; i++) {
      images.push(`photos/rg56/main56/${String(i).padStart(2,'0')}.png`);
    }
  }

  if (room === "rg56" && category === "kitchen56") {
    for (let i = 1; i <= 6; i++) {
      images.push(`photos/rg56/kitchen56/${String(i).padStart(2,'0')}.png`);
    }
  }

  return images;
}

let currentIndex = 0;

function initSlider(room, category) {
  const container = document.getElementById("slider");
  if (!container) return;

  container.innerHTML = "";
  currentIndex = 0;

  const images = getImages(room, category);

  images.forEach((src, index) => {
    const img = document.createElement("img");
    img.src = src + "?v=stable1";
    img.className = "slide-image";
    img.style.display = index === 0 ? "block" : "none";
    container.appendChild(img);
  });
}

function nextSlide() {
  const slides = document.querySelectorAll(".slide-image");
  if (!slides.length) return;

  slides[currentIndex].style.display = "none";
  currentIndex = (currentIndex + 1) % slides.length;
  slides[currentIndex].style.display = "block";
}

function prevSlide() {
  const slides = document.querySelectorAll(".slide-image");
  if (!slides.length) return;

  slides[currentIndex].style.display = "none";
  currentIndex = (currentIndex - 1 + slides.length) % slides.length;
  slides[currentIndex].style.display = "block";
}
