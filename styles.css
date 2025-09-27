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

// Placeholder for Collections Gallery (e.g., lazy-load more NFTs)
// const collectionsGrid = document.querySelector('.collections__grid');
// // Implement load more via XRP.Cafe API if provided

// Placeholder for Analytics Integration
// e.g., Track events: gtag('event', 'click', { 'event_category': 'button', 'event_label': 'nft_explore' });
