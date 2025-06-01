// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Enhanced animation system
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.section, .section h2, .section p, .section .lead, .writing-item, .media-item, .project-card, .timeline-item');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        const isVisible = (elementTop < window.innerHeight - 100) && (elementBottom > 0);
        
        if (isVisible) {
            element.classList.add('animate-in');
        }
    });
};

// Add animation classes to elements
document.querySelectorAll('.section, .section h2, .section p, .section .lead, .writing-item, .media-item, .project-card, .timeline-item').forEach(element => {
    element.classList.add('animate-element');
});

// Initial check for elements in view
animateOnScroll();

// Listen for scroll events
window.addEventListener('scroll', animateOnScroll);

// Navbar background change on scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Navbar name visibility and expansion
const navName = document.querySelector('.nav-name');
const heroTitle = document.querySelector('.hero-content h1');

function updateNavNameVisibility() {
    const heroTitleBottom = heroTitle.getBoundingClientRect().bottom;
    if (heroTitleBottom < 0) {
        navName.classList.add('visible');
        navbar.classList.add('expanded');
    } else {
        navName.classList.remove('visible');
        navbar.classList.remove('expanded');
    }
}

window.addEventListener('scroll', updateNavNameVisibility);
window.addEventListener('resize', updateNavNameVisibility);

// Initial check
updateNavNameVisibility();

// Writing Carousel
document.addEventListener('DOMContentLoaded', function() {
    const writingGrid = document.querySelector('.writing-grid');
    const prevButton = document.querySelector('.carousel-prev');
    const nextButton = document.querySelector('.carousel-next');
    
    if (!writingGrid || !prevButton || !nextButton) return;

    const itemWidth = 350; // Width of each item including gap
    const gap = 40; // Gap between items
    
    function updateButtonVisibility() {
        const scrollLeft = writingGrid.scrollLeft;
        const maxScroll = writingGrid.scrollWidth - writingGrid.clientWidth;
        
        prevButton.style.opacity = scrollLeft > 0 ? '1' : '0';
        nextButton.style.opacity = scrollLeft < maxScroll ? '1' : '0';
    }

    function scrollToNext() {
        const currentScroll = writingGrid.scrollLeft;
        const itemsPerView = Math.floor(writingGrid.clientWidth / itemWidth);
        const scrollAmount = itemsPerView * itemWidth;
        
        writingGrid.scrollTo({
            left: currentScroll + scrollAmount,
            behavior: 'smooth'
        });
    }

    function scrollToPrev() {
        const currentScroll = writingGrid.scrollLeft;
        const itemsPerView = Math.floor(writingGrid.clientWidth / itemWidth);
        const scrollAmount = itemsPerView * itemWidth;
        
        writingGrid.scrollTo({
            left: currentScroll - scrollAmount,
            behavior: 'smooth'
        });
    }

    // Event listeners
    nextButton.addEventListener('click', scrollToNext);
    prevButton.addEventListener('click', scrollToPrev);
    writingGrid.addEventListener('scroll', updateButtonVisibility);

    // Initial button visibility
    updateButtonVisibility();

    // Update on window resize
    window.addEventListener('resize', updateButtonVisibility);
}); 