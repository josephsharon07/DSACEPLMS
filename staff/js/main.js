// Common UI enhancement functions
function initializeTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(element => {
        element.addEventListener('mouseenter', e => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip absolute bg-gray-800 text-white text-sm px-2 py-1 rounded-lg z-50 transform -translate-y-full -mt-2';
            tooltip.textContent = element.getAttribute('data-tooltip');
            element.appendChild(tooltip);
        });

        element.addEventListener('mouseleave', e => {
            const tooltip = element.querySelector('.tooltip');
            if (tooltip) tooltip.remove();
        });
    });
}

function initializeRippleEffect() {
    const buttons = document.querySelectorAll('.button-primary, .button-secondary, .nav-button');
    buttons.forEach(button => {
        button.addEventListener('click', e => {
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size/2;
            const y = e.clientY - rect.top - size/2;
            
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.className = 'ripple';
            
            button.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

function initializeDropdownMenus() {
    const dropdowns = document.querySelectorAll('.dropdown-trigger');
    dropdowns.forEach(dropdown => {
        const menu = dropdown.nextElementSibling;
        dropdown.addEventListener('click', () => {
            menu.classList.toggle('hidden');
        });

        document.addEventListener('click', e => {
            if (!dropdown.contains(e.target)) {
                menu.classList.add('hidden');
            }
        });
    });
}

// Initialize all UI enhancements when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeTooltips();
    initializeRippleEffect();
    initializeDropdownMenus();
});