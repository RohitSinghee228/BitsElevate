// Form Validation
document.addEventListener('DOMContentLoaded', function() {
    // Payment Form Validation
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate card number
            const cardNumber = document.querySelector('input[name="cardNumber"]').value;
            if (!validateCardNumber(cardNumber)) {
                showAlert('Invalid card number', 'danger');
                return;
            }

            // Validate expiry date
            const expiryDate = document.querySelector('input[name="expiryDate"]').value;
            if (!validateExpiryDate(expiryDate)) {
                showAlert('Invalid expiry date', 'danger');
                return;
            }

            // Validate CVV
            const cvv = document.querySelector('input[name="cvv"]').value;
            if (!validateCVV(cvv)) {
                showAlert('Invalid CVV', 'danger');
                return;
            }

            // If all validations pass, submit the form
            this.submit();
        });
    }

    // Add fade-in animation to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
    });
});

// Helper Functions
function validateCardNumber(number) {
    // Remove spaces and check if it's a valid number
    number = number.replace(/\s/g, '');
    return /^\d{16}$/.test(number);
}

function validateExpiryDate(date) {
    // Check if date is in MM/YY format
    if (!/^\d{2}\/\d{2}$/.test(date)) return false;
    
    const [month, year] = date.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    const expiryYear = parseInt(year);
    const expiryMonth = parseInt(month);
    
    if (expiryYear < currentYear) return false;
    if (expiryYear === currentYear && expiryMonth < currentMonth) return false;
    if (expiryMonth < 1 || expiryMonth > 12) return false;
    
    return true;
}

function validateCVV(cvv) {
    return /^\d{3,4}$/.test(cvv);
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Remove alert after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Progress Bar Animation
function animateProgressBar(progressBar) {
    const targetWidth = progressBar.getAttribute('aria-valuenow');
    let currentWidth = 0;
    
    const interval = setInterval(() => {
        if (currentWidth >= targetWidth) {
            clearInterval(interval);
            return;
        }
        
        currentWidth++;
        progressBar.style.width = `${currentWidth}%`;
        progressBar.setAttribute('aria-valuenow', currentWidth);
        progressBar.textContent = `${currentWidth}%`;
    }, 20);
}

// Initialize progress bar animations
document.addEventListener('DOMContentLoaded', function() {
    const progressBars = document.querySelectorAll('.progress-bar');
    progressBars.forEach(animateProgressBar);
});

// Course Card Hover Effect
document.addEventListener('DOMContentLoaded', function() {
    const courseCards = document.querySelectorAll('.course-card');
    
    courseCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}); 