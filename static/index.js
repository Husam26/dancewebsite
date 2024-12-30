document.addEventListener("DOMContentLoaded", function () {
    // Typing Effect
    const typingText = document.getElementById('typing-text');
    if (typingText) { // Ensure the element exists
        let text = typingText.textContent;
        typingText.textContent = '';

        let index = 0;
        const typingSpeed = 150; // Speed of typing (ms)

        function typeWriter() {
            if (index < text.length) {
                typingText.textContent += text.charAt(index);
                index++;
                setTimeout(typeWriter, typingSpeed);
            } else {
                typingText.style.borderRight = 'none'; // Remove blinking cursor
            }
        }
        typeWriter();
    }

    // Reveal on Scroll
    const revealElements = document.querySelectorAll('.card, .cta-button, .sponsor-card');
    if (revealElements.length) { // Ensure there are elements to reveal
        function revealOnScroll() {
            const viewportHeight = window.innerHeight;
            revealElements.forEach((el) => {
                const elementTop = el.getBoundingClientRect().top;
                if (elementTop < viewportHeight - 100) {
                    el.classList.add('visible'); // Add a CSS class to trigger animation
                }
            });
        }

        window.addEventListener('scroll', revealOnScroll);
        revealOnScroll(); // Trigger on page load
    }

    // Sponsors Section Auto-Scroll
    const sponsorContainer = document.querySelector('.sponsors-container');
    if (sponsorContainer) {
        const scrollInterval = 2000; // Time in ms
        setInterval(() => {
            sponsorContainer.scrollBy({ left: 300, behavior: 'smooth' });
            if (sponsorContainer.scrollLeft + sponsorContainer.offsetWidth >= sponsorContainer.scrollWidth) {
                sponsorContainer.scrollTo({ left: 0, behavior: 'smooth' });
            }
        }, scrollInterval);
    }
});
