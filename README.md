# Sriram Selvam's Personal Website

A modern, responsive personal website built with HTML, CSS, and JavaScript. This website serves as a professional portfolio and personal brand page.

## Features

- Responsive design that works on all devices
- Modern and clean UI with smooth animations
- Sections for About, Thesis, Writing, Media Coverage, Projects, and Experience
- Smooth scrolling navigation
- Intersection Observer for scroll animations
- Social media integration

## Getting Started

1. Clone this repository
2. Customize the content in `index.html` with your personal information
3. Modify the styles in `styles.css` to match your preferences
4. Update the social media links in the hero section
5. Add your projects, writing, and experience details
6. Deploy to GitHub Pages or your preferred hosting service

## Customization

### Colors
The color scheme can be modified in the `:root` section of `styles.css`:

```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #1e40af;
    --text-color: #1f2937;
    --light-text: #6b7280;
    --background: #ffffff;
    --section-bg: #f9fafb;
    --border-color: #e5e7eb;
}
```

### Content
Update the following sections in `index.html`:
- Hero section with your name and title
- About section with your introduction
- Thesis section with your research work
- Writing section with your articles
- Projects section with your work
- Experience section with your work history
- Resume section with your CV

### Social Links
Update the social media links in the hero section:

```html
<div class="social-links">
    <a href="https://github.com/yourusername" target="_blank"><i class="fab fa-github"></i></a>
    <a href="https://linkedin.com/in/yourusername" target="_blank"><i class="fab fa-linkedin"></i></a>
    <a href="mailto:your.email@example.com"><i class="fas fa-envelope"></i></a>
</div>
```

## Deployment

To deploy to GitHub Pages:

1. Push your changes to the main branch
2. Go to your repository settings
3. Under "GitHub Pages", select the main branch as the source
4. Your site will be published at `https://yourusername.github.io`

## License

This project is open source and available under the MIT License.