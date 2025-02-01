document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Validaciones básicas
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

        try {
            const response = await fetch('/api/Auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre: name,
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Guardamos el token en localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.id);
                localStorage.setItem('userName', data.nombre);
                
                // Redirigimos al dashboard
                window.location.href = 'dashboard.html';
            } else {
                alert(data.message || 'Error en el registro');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error en el registro');
        }
    });
});