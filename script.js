// Mobile Menu Toggle
const hamburger = document.querySelector('.header__hamburger');
const nav = document.querySelector('.header__nav');

hamburger.addEventListener('click', () => {
    nav.style.display = nav.style.display === 'block' ? 'none' : 'block';
});

// Form Validation (Contact Form Example)
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        if (!name || !email || !message) {
            alert('Please fill all fields.');
            e.preventDefault();
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            alert('Invalid email.');
            e.preventDefault();
        }
        // Placeholder for API submission: fetch('/api/contact', { method: 'POST', body: JSON.stringify({name, email, message}) });
    });
}

// Scroll to Top
const scrollTop = document.querySelector('.scroll-top');
window.addEventListener('scroll', () => {
    scrollTop.style.display = window.scrollY > 200 ? 'block' : 'none';
});

scrollTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Placeholder for Carousel Sliding
// const carouselWrapper = document.querySelector('.carousel__wrapper');
// // Implement snap or arrows as needed

// Placeholder for Infinite Scroll (Blog)
// window.addEventListener('scroll', () => {
//     if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
//         // Load more posts via API
//     }
// });

// Placeholder for Analytics Integration
// e.g., Track events: gtag('event', 'click', { 'event_category': 'button', 'event_label': 'join' });

// Placeholder for API Integrations
// e.g., Fetch NFT stats: fetch('https://xrp.cafe/api/collections').then(res => res.json()).then(data => { /* render */ });
