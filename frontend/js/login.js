document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado completamente');
    
    const form = document.querySelector('form');
    const registroBtn = document.querySelector('.btn-secondary');

    // Verificar si ya hay un token (usuario ya autenticado)
    const token = localStorage.getItem('token');
    console.log('Token existente:', token ? 'Sí' : 'No');
    
    if (token) {
        console.log('Usuario ya autenticado, redirigiendo al dashboard...');
        window.location.href = './dashboard.html';
        return;
    }

    // Manejar el envío del formulario de login
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Inicio del proceso de login');

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        console.log('Email ingresado:', email);
        console.log('Intentando login...');

        try {
            console.log('Enviando petición al servidor...');
            const response = await fetch('http://localhost:5230/api/Auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            console.log('Respuesta del servidor recibida:', response.status);
            const data = await response.json();
            console.log('Datos recibidos:', data);

            if (response.ok) {
                console.log('Login exitoso, guardando datos...');
                // Guardamos el token y datos del usuario
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.id);
                localStorage.setItem('userName', data.nombre);
                
                console.log('Token guardado:', data.token);
                console.log('UserId guardado:', data.id);
                console.log('UserName guardado:', data.nombre);
                
                console.log('Redirigiendo al dashboard...');
                window.location.href = './dashboard.html';
            } else {
                console.error('Error en la respuesta:', data);
                alert(data.message || 'Error en el inicio de sesión');
            }
        } catch (error) {
            console.error('Error en la petición:', error);
            alert('Error en el inicio de sesión');
        }
    });

    // Manejar el botón de registro
    registroBtn.addEventListener('click', function() {
        console.log('Redirigiendo a registro...');
        window.location.href = './pages/register.html';
    });
});