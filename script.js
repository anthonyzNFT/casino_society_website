document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const navList = document.querySelector('.header__nav-list');
    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            const isOpen = navList.classList.toggle('active');
            menuToggle.textContent = isOpen ? '✕' : '☰';
            menuToggle.setAttribute('aria-expanded', isOpen);
        });
    }

    const navLinks = document.querySelectorAll('.header__nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
            if (navList && navList.classList.contains('active')) {
                navList.classList.remove('active');
                menuToggle.textContent = '☰';
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

    if ('IntersectionObserver' in window) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        images.forEach(img => observer.observe(img));
    }

    // Meme carousel arrow controls
    const carousel = document.querySelector('.memes__carousel');
    const wrapper = document.querySelector('.memes__wrapper');
    const leftArrow = document.querySelector('.memes__arrow--left');
    const rightArrow = document.querySelector('.memes__arrow--right');
    if (carousel && wrapper && leftArrow && rightArrow) {
        let isPaused = false;

        // Pause auto-scroll on hover
        carousel.addEventListener('mouseenter', () => {
            isPaused = true;
            wrapper.style.animationPlayState = 'paused';
        });
        carousel.addEventListener('mouseleave', () => {
            isPaused = false;
            wrapper.style.animationPlayState = 'running';
        });

        // Arrow controls
        leftArrow.addEventListener('click', () => {
            wrapper.scrollBy({ left: -300, behavior: 'smooth' });
        });
        rightArrow.addEventListener('click', () => {
            wrapper.scrollBy({ left: 300, behavior: 'smooth' });
        });

        // Auto-scroll when in view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !isPaused) {
                    wrapper.style.animationPlayState = 'running';
                } else {
                    wrapper.style.animationPlayState = 'paused';
                }
            });
        }, { threshold: 0.5 });
        observer.observe(carousel);
    }
});

window.scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};
