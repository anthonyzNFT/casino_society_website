// Mobile Menu Toggle
const hamburger = document.querySelector('.header__hamburger');
const nav = document.querySelector('.header__nav');
const search = document.querySelector('.header__search');
const actions = document.querySelector('.header__actions');

hamburger.addEventListener('click', () => {
    nav.style.display = nav.style.display === 'block' ? 'none' : 'block';
    search.style.display = search.style.display === 'block' ? 'none' : 'block';
    actions.style.display = actions.style.display === 'flex' ? 'none' : 'flex';
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

// Modal Toggle (Example for Sign-Up)
const signupBtn = document.querySelector('.btn--signup');
const modal = document.getElementById('signup-modal');
const closeModal = document.querySelector('.modal__close');

if (signupBtn && modal) {
    signupBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
}
