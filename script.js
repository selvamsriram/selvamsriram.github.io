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

// Enhanced animation system with mobile optimization
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.section, .section h2, .section p, .section .lead, .writing-item, .media-item, .project-card, .timeline-item, .achievements li');
    const mobileOffset = window.innerWidth <= 768 ? 100 : 150; // Increased offset to trigger earlier
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        const isVisible = (elementTop < window.innerHeight - mobileOffset) && (elementBottom > 0);
        
        if (isVisible) {
            element.classList.add('animate-in');
        }
    });
};

// Add animation classes to elements
document.querySelectorAll('.section, .section h2, .section p, .section .lead, .writing-item, .media-item, .project-card, .timeline-item, .achievements li').forEach(element => {
    element.classList.add('animate-element');
});

// Initial check for elements in view
animateOnScroll();

// Listen for scroll events with throttling
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
            animateOnScroll();
            scrollTimeout = null;
        }, 50); // Reduced timeout for more responsive animations
    }
});

// Navbar background change on scroll with mobile optimization
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

// Navbar name visibility and expansion with mobile optimization
const navName = document.querySelector('.nav-name');
const heroTitle = document.querySelector('.hero-content h1');

function updateNavNameVisibility() {
    if (!navName || !heroTitle) return;
    
    const heroTitleBottom = heroTitle.getBoundingClientRect().bottom;
    const isMobile = window.innerWidth <= 768;
    
    if (heroTitleBottom < 0 || isMobile) {
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

// Writing Carousel with mobile optimization
document.addEventListener('DOMContentLoaded', function() {
    const writingGrid = document.querySelector('.writing-grid');
    const prevButton = document.querySelector('.carousel-prev');
    const nextButton = document.querySelector('.carousel-next');
    
    if (!writingGrid || !prevButton || !nextButton) return;

    const isMobile = window.innerWidth <= 768;
    const itemWidth = isMobile ? 280 : 350; // Adjusted width for mobile
    const gap = isMobile ? 20 : 40; // Adjusted gap for mobile
    
    function updateButtonVisibility() {
        const scrollLeft = writingGrid.scrollLeft;
        const maxScroll = writingGrid.scrollWidth - writingGrid.clientWidth;
        
        prevButton.style.opacity = scrollLeft > 0 ? '1' : '0';
        nextButton.style.opacity = scrollLeft < maxScroll ? '1' : '0';
    }

    function scrollToNext() {
        const currentScroll = writingGrid.scrollLeft;
        const scrollAmount = itemWidth + gap;
        
        writingGrid.scrollTo({
            left: currentScroll + scrollAmount,
            behavior: 'smooth'
        });
    }

    function scrollToPrev() {
        const currentScroll = writingGrid.scrollLeft;
        const scrollAmount = itemWidth + gap;
        
        writingGrid.scrollTo({
            left: currentScroll - scrollAmount,
            behavior: 'smooth'
        });
    }

    // Add touch scrolling support
    let isDown = false;
    let startX;
    let scrollLeft;

    writingGrid.addEventListener('mousedown', (e) => {
        isDown = true;
        writingGrid.style.cursor = 'grabbing';
        startX = e.pageX - writingGrid.offsetLeft;
        scrollLeft = writingGrid.scrollLeft;
    });

    writingGrid.addEventListener('mouseleave', () => {
        isDown = false;
        writingGrid.style.cursor = 'grab';
    });

    writingGrid.addEventListener('mouseup', () => {
        isDown = false;
        writingGrid.style.cursor = 'grab';
    });

    writingGrid.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - writingGrid.offsetLeft;
        const walk = (x - startX) * 2;
        writingGrid.scrollLeft = scrollLeft - walk;
    });

    // Touch events
    writingGrid.addEventListener('touchstart', (e) => {
        isDown = true;
        startX = e.touches[0].pageX - writingGrid.offsetLeft;
        scrollLeft = writingGrid.scrollLeft;
    });

    writingGrid.addEventListener('touchend', () => {
        isDown = false;
    });

    writingGrid.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.touches[0].pageX - writingGrid.offsetLeft;
        const walk = (x - startX) * 2;
        writingGrid.scrollLeft = scrollLeft - walk;
    });

    // Event listeners
    nextButton.addEventListener('click', scrollToNext);
    prevButton.addEventListener('click', scrollToPrev);
    writingGrid.addEventListener('scroll', updateButtonVisibility);

    // Initial button visibility
    updateButtonVisibility();

    // Update on window resize with debouncing
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateButtonVisibility();
        }, 250);
    });
});

// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('active') && 
        !navLinks.contains(e.target) && 
        !mobileMenuBtn.contains(e.target)) {
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Close menu when clicking a link
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
    });
}); 