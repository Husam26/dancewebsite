const prevBtn = document.getElementById("prev-slide");
const nextBtn = document.getElementById("next-slide");
const carouselSlide = document.querySelector(".carousel-slide");
const items = document.querySelectorAll(".carousel-item");
let counter = 0;

nextBtn.addEventListener("click", () => {
    if (counter >= items.length - 1) {
        counter = 0;
    } else {
        counter++;
    }
    updateCarousel();
});

prevBtn.addEventListener("click", () => {
    if (counter <= 0) {
        counter = items.length - 1;
    } else {
        counter--;
    }
    updateCarousel();
});

function updateCarousel() {
    carouselSlide.style.transform = `translateX(${-counter * (items[0].clientWidth + 20)}px)`;
}
// JavaScript for Carousel Navigation
let currentIndex = 0;
const testimonials = document.querySelectorAll('.testimonial-item');
const totalTestimonials = testimonials.length;

document.querySelector('#next').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % totalTestimonials;
    updateCarousel();
});

document.querySelector('#prev').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + totalTestimonials) % totalTestimonials;
    updateCarousel();
});

function updateCarousel() {
    const carousel = document.querySelector('.testimonial-carousel');
    const offset = -currentIndex * 320; // Adjust based on the width of each card
    carousel.style.transform = `translateX(${offset}px)`;
}

// Automatic slide every 3 seconds
setInterval(() => {
    currentIndex = (currentIndex + 1) % totalTestimonials;
    updateCarousel();
}, 3000);
