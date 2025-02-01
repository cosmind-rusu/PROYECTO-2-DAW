
import { fetchAuth } from './api.js';
import { showNotification } from './utils.js';

export function initAhorro() {
    const ahorrosList = document.querySelector('.savings-list');
    const ahorroForm = document.getElementById('savingForm');

    async function loadAhorros() {
        try {
            const response = await fetchAuth('/Ahorro');
            if (response && response.ok) {
                const ahorros = await response.json();
                displayAhorros(ahorros);
            }
        } catch (error) {
            console.error('Error al cargar ahorros:', error);
            showNotification('Error al cargar los ahorros', 'error');
        }
    }

    function displayAhorros(ahorros) {
        ahorrosList.innerHTML = '';

        if (ahorros.length === 0) {
            ahorrosList.innerHTML = `
                <div class="text-center text-muted p-3">
                    No tienes objetivos de ahorro definidos
                </div>
            `;
            return;
        }

        ahorros.forEach(ahorro => {
            ahorrosList.innerHTML += `
                <div class="saving-item" data-id="${ahorro.id}">
                    <div class="saving-details">
                        <h5 class="mb-1">${ahorro.nombre}</h5>
                        <div class="progress mb-2">
                            <div class="progress-bar" role="progressbar" 
                                 style="width: ${ahorro.porcentajeCompletado}%" 
                                 aria-valuenow="${ahorro.porcentajeCompletado}" 
                                 aria-valuemin="0" 
                                 aria-valuemax="100">
                            </div>
                        </div>
                        <div class="d-flex justify-content-between">
                            <small class="text-muted">Actual: €${ahorro.montoActual.toFixed(2)}</small>
                            <small class="saving-goal">Meta: €${ahorro.metaAhorro.toFixed(2)}</small>
                        </div>
                        ${ahorro.fechaObjetivo ? `
                            <small class="text-muted d-block">
                                Fecha objetivo: ${new Date(ahorro.fechaObjetivo).toLocaleDateString()}
                            </small>
                        ` : ''}
                    </div>
                    <button class="btn btn-danger btn-sm delete-ahorro ms-3">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });
    }

    ahorroForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const ahorroData = {
            nombre: document.getElementById('savingName').value,
            metaAhorro: parseFloat(document.getElementById('savingGoal').value),
            montoActual: parseFloat(document.getElementById('savingCurrent').value),
            fechaObjetivo: document.getElementById('savingDate').value || null,
            descripcion: document.getElementById('savingDescription').value
        };

        try {
            const response = await fetchAuth('/Ahorro', {
                method: 'POST',
                body: JSON.stringify(ahorroData)
            });

            if (response && response.ok) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('addSavingModal'));
                modal.hide();
                ahorroForm.reset();
                await loadAhorros();
                showNotification('Objetivo de ahorro creado correctamente', 'success');
            } else {
                showNotification('Error al guardar el objetivo de ahorro', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error al conectar con el servidor', 'error');
        }
    });

    ahorrosList.addEventListener('click', async function (e) {
        if (e.target.closest('.delete-ahorro')) {
            const ahorroItem = e.target.closest('.saving-item');
            const id = ahorroItem.dataset.id;
            if (confirm('¿Estás seguro de que quieres eliminar este objetivo de ahorro?')) {
                try {
                    const response = await fetchAuth(`/Ahorro/${id}`, {
                        method: 'DELETE'
                    });
                    if (response && response.ok) {
                        await loadAhorros();
                        showNotification('Objetivo de ahorro eliminado correctamente', 'success');
                    } else {
                        showNotification('Error al eliminar el objetivo de ahorro', 'error');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showNotification('Error al conectar con el servidor', 'error');
                }
            }
        }
    });

    // Cargar los ahorros al inicializar
    loadAhorros();
}
