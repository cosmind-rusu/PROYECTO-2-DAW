
import { fetchAuth } from './api.js';
import { showNotification } from './utils.js';

export function initSuscripciones() {
    const subscriptionList = document.querySelector('.subscription-list');
    const subscriptionForm = document.getElementById('subscriptionForm');
    const totalSpan = document.querySelector('.total-subscriptions .fw-bold');

    async function loadSubscriptions() {
        try {
            const response = await fetchAuth('/Suscripcion');
            if (response && response.ok) {
                const suscripciones = await response.json();
                displaySubscriptions(suscripciones);
            }
        } catch (error) {
            console.error('Error al cargar suscripciones:', error);
            showNotification('Error al cargar las suscripciones', 'error');
        }
    }

    function displaySubscriptions(suscripciones) {
        subscriptionList.innerHTML = '';
        let total = 0;

        if (suscripciones.length === 0) {
            subscriptionList.innerHTML = `
                <div class="text-center text-muted p-3">
                    No tienes suscripciones activas
                </div>
            `;
            totalSpan.textContent = '€0.00';
            return;
        }

        suscripciones.forEach(sub => {
            total += sub.precio;
            subscriptionList.innerHTML += `
                <div class="subscription-item" data-id="${sub.id}">
                    <div class="flex-grow-1">
                        <h5 class="mb-0">${sub.nombre}</h5>
                        <small class="text-muted">${sub.tipoServicio}</small>
                    </div>
                    <span class="badge bg-primary rounded-pill me-2">€${sub.precio.toFixed(2)}/mes</span>
                    <button class="btn btn-danger btn-sm delete-subscription">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });

        totalSpan.textContent = `€${total.toFixed(2)}`;
    }

    subscriptionForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const subscriptionData = {
            nombre: document.getElementById('subscriptionName').value,
            precio: parseFloat(document.getElementById('subscriptionAmount').value),
            tipoServicio: document.getElementById('subscriptionType').value,
            fechaInicio: new Date().toISOString(),
            cicloCobro: "mensual"
        };

        try {
            const response = await fetchAuth('/Suscripcion', {
                method: 'POST',
                body: JSON.stringify(subscriptionData)
            });

            if (response && response.ok) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('addSubscriptionModal'));
                modal.hide();
                subscriptionForm.reset();
                await loadSubscriptions();
                showNotification('Suscripción creada correctamente', 'success');
            } else {
                showNotification('Error al guardar la suscripción', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error al conectar con el servidor', 'error');
        }
    });

    // Delegar el evento para eliminar una suscripción
    subscriptionList.addEventListener('click', async function (e) {
        if (e.target.closest('.delete-subscription')) {
            const subscriptionItem = e.target.closest('.subscription-item');
            const id = subscriptionItem.dataset.id;
            if (confirm('¿Estás seguro de que quieres eliminar esta suscripción?')) {
                try {
                    const response = await fetchAuth(`/Suscripcion/${id}`, {
                        method: 'DELETE'
                    });
                    if (response && response.ok) {
                        await loadSubscriptions();
                        showNotification('Suscripción eliminada correctamente', 'success');
                    } else {
                        showNotification('Error al eliminar la suscripción', 'error');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showNotification('Error al conectar con el servidor', 'error');
                }
            }
        }
    });

    // Cargar las suscripciones al inicializar
    loadSubscriptions();
}
