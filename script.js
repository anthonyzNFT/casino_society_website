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

    // Meme carousel auto-scroll control
    const carousel = document.querySelector('.memes__carousel');
    const wrapper = document.querySelector('.memes__wrapper');
    if (carousel && wrapper) {
        let isPaused = false;
        carousel.addEventListener('mouseenter', () => {
            isPaused = true;
            wrapper.style.animationPlayState = 'paused';
        });
        carousel.addEventListener('mouseleave', () => {
            isPaused = false;
            wrapper.style.animationPlayState = 'running';
        });
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
        wrapper.addEventListener('animationiteration', () => {
            wrapper.style.animation = 'none';
            wrapper.offsetHeight; // Trigger reflow
            wrapper.style.animation = 'autoSlide 120s linear infinite';
        });
    }
});

window.scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};
