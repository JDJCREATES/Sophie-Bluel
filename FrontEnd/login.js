document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:5678/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            if (response.ok) {
                const data = await response.json();
                
                // Store the token in localStorage
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userId', data.userId);
                
                // Hide error message if it was shown
                errorMessage.style.display = 'none';
                
                // Redirect to main page
                window.location.href = 'index.html';
            } else {
                // Show error message
                errorMessage.style.display = 'block';
                
                // Clear the form
                document.getElementById('email').value = '';
                document.getElementById('password').value = '';
            }
        } catch (error) {
            console.error('Login error:', error);
            errorMessage.style.display = 'block';
        }
    });
});
