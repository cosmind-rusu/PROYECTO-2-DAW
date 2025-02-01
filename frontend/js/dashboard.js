// dashboard.js
import auth from './auth.js';
import { initSuscripciones } from './suscripcion.js';
import { initTransacciones } from './transaccion.js';
import { initAhorro } from './ahorro.js';

document.addEventListener('DOMContentLoaded', async function () {
    console.log('Dashboard inicializando...');

    // Verificar autenticación
    if (!auth.checkAuth()) {
        console.log('No autenticado, redirigiendo...');
        return;
    }
    console.log('Usuario autenticado, token:', auth.getToken());

    // Inicializar cada módulo
    initSuscripciones();
    initTransacciones();
    initAhorro();

    // Manejar el cierre de sesión
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        console.log('Cerrando sesión...');
        auth.logout();
    });
});
