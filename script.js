document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('mobile-menu');
    const navLinks = document.querySelectorAll('.header__nav-link');
    const body = document.body;

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });

        menuToggle.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });

        function toggleMenu() {
            const isOpen = nav.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', isOpen);
            
            if (isOpen) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = '';
            }
        }

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const targetId = href.substring(1);
                    const targetSection = document.getElementById(targetId);
                    
                    if (targetSection) {
                        if (nav.classList.contains('active')) {
                            nav.classList.remove('active');
                            menuToggle.setAttribute('aria-expanded', 'false');
                            body.style.overflow = '';
                        }
                        
                        setTimeout(() => {
                            targetSection.scrollIntoView({ 
                                behavior: 'smooth',
                                block: 'start'
                            });
                        }, 300);
                    }
                } else {
                    if (nav.classList.contains('active')) {
                        nav.classList.remove('active');
                        menuToggle.setAttribute('aria-expanded', 'false');
                        body.style.overflow = '';
                    }
                }
            });
        });

        document.addEventListener('click', (e) => {
            if (nav.classList.contains('active') && 
                !nav.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                nav.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                body.style.overflow = '';
            }
        });
    }

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });

        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }

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

        const carouselObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !isPaused) {
                    wrapper.style.animationPlayState = 'running';
                } else {
                    wrapper.style.animationPlayState = 'paused';
                }
            });
        }, { 
            threshold: 0.25 
        });
        
        carouselObserver.observe(carousel);
    }

    const faqItems = document.querySelectorAll('.faq__item');
    faqItems.forEach(item => {
        const summary = item.querySelector('.faq__question');
        if (summary) {
            summary.addEventListener('click', (e) => {
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.hasAttribute('open')) {
                        otherItem.removeAttribute('open');
                    }
                });
            });
        }
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.nfts__card, .games__item, .faq__item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        fadeInObserver.observe(el);
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    let lastScrollTop = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    }, { passive: true });

    if (header) {
        header.style.transition = 'transform 0.3s ease-in-out';
    }
});

window.scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
};
