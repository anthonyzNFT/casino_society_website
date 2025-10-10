// Global script for Casino Society: Menu toggle, NFT API fetch, form submission, shared utils
// Optimized for performance: No external deps, async fetches

document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle (BEM: header__menu-toggle)
    const menuToggle = document.getElementById('menu-toggle');
    const navList = document.getElementById('mobile-menu');
    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            navList.classList.toggle('active');
        });
    }

    // NFT stats fetch (placeholder for xrp.cafe API - uncomment and add key)
    const nftGrid = document.getElementById('nft-stats');
    if (nftGrid) {
        fetchNFTStats(); // Async load
    }

    // Contact form submission (WCAG: ARIA live for feedback)
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            // Placeholder: Replace with backend endpoint (e.g., fetch('/api/contact'))
            try {
                // await fetch('/api/contact', { method: 'POST', body: formData });
                alert('Message sent! (Demo)'); // Temp feedback
                form.reset();
            } catch (error) {
                console.error('Form error:', error);
                alert('Error sending message. Try again.');
            }
        });
    }

    // Shared utils: Lazy-load images for performance
    const images = document.querySelectorAll('img[loading="lazy"]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.src = entry.target.dataset.src || entry.target.src;
                observer.unobserve(entry.target);
            }
        });
    });
    images.forEach(img => observer.observe(img));
});

// Fetch NFT stats (async, error-handled)
async function fetchNFTStats() {
    const nftGrid = document.getElementById('nft-stats');
    if (!nftGrid) return;
    try {
        // Placeholder API: Replace with real xrp.cafe endpoint
        const response = await fetch('https://api.xrp.cafe/collections/stats'); // Example
        const data = await response.json();
        nftGrid.innerHTML = `
            <div class="nfts__card">
                <h3>Total NFTs</h3>
                <p>${data.total || '1,234'}</p>
            </div>
            <div class="nfts__card">
                <h3>Floor Price</h3>
                <p>${data.floor || '0.5 XRP'}</p>
            </div>
            <div class="nfts__card">
                <h3>Volume</h3>
                <p>${data.volume || '$10K'}</p>
            </div>
        `;
    } catch (error) {
        console.error('NFT fetch error:', error);
        nftGrid.innerHTML = '<p class="nfts__error">Loading stats...</p>';
    }
}

// Export for Solitaire integration (if needed)
window.CasinoSocietyUtils = { fetchNFTStats };
