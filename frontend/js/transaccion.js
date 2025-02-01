
import { fetchAuth } from './api.js';
import { showNotification } from './utils.js';

export function initTransacciones() {
    const transactionList = document.querySelector('.transaction-list');
    const transactionForm = document.getElementById('transactionForm');
    const balanceSpan = document.querySelector('.total-balance .fw-bold');

    async function loadTransactions() {
        try {
            const response = await fetchAuth('/Transaccion');
            if (response && response.ok) {
                const transacciones = await response.json();
                displayTransactions(transacciones);
            }
        } catch (error) {
            console.error('Error al cargar transacciones:', error);
            showNotification('Error al cargar las transacciones', 'error');
        }
    }

    function displayTransactions(transacciones) {
        transactionList.innerHTML = '';
        let balance = 0;

        if (transacciones.length === 0) {
            transactionList.innerHTML = `
                <div class="text-center text-muted p-3">
                    No tienes transacciones registradas
                </div>
            `;
            balanceSpan.textContent = '€0.00';
            return;
        }

        // Ordenar las transacciones por fecha (más recientes primero)
        transacciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        transacciones.forEach(trans => {
            const amount = trans.tipo.toLowerCase() === 'ingreso' ? trans.monto : -trans.monto;
            balance += amount;

            transactionList.innerHTML += `
                <div class="transaction-item" data-id="${trans.id}">
                    <div class="flex-grow-1">
                        <h5 class="mb-0">${trans.concepto}</h5>
                        <small class="text-muted">${trans.categoria} - ${new Date(trans.fecha).toLocaleDateString()}</small>
                    </div>
                    <span class="transaction-amount ${trans.tipo.toLowerCase()} me-2">
                        ${trans.tipo === 'ingreso' ? '+' : '-'}€${Math.abs(trans.monto).toFixed(2)}
                    </span>
                    <button class="btn btn-danger btn-sm delete-transaction">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });

        balanceSpan.textContent = `€${balance.toFixed(2)}`;
        balanceSpan.classList.toggle('text-success', balance > 0);
        balanceSpan.classList.toggle('text-danger', balance < 0);
    }

    transactionForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const transactionData = {
            concepto: document.getElementById('transactionDescription').value,
            monto: parseFloat(document.getElementById('transactionAmount').value),
            tipo: document.getElementById('transactionType').value,
            categoria: document.getElementById('transactionCategory').value,
            fecha: new Date().toISOString(),
            notas: ''
        };

        try {
            const response = await fetchAuth('/Transaccion', {
                method: 'POST',
                body: JSON.stringify(transactionData)
            });

            if (response && response.ok) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('addTransactionModal'));
                modal.hide();
                transactionForm.reset();
                await loadTransactions();
                showNotification('Transacción registrada correctamente', 'success');
            } else {
                showNotification('Error al guardar la transacción', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error al conectar con el servidor', 'error');
        }
    });

    transactionList.addEventListener('click', async function (e) {
        if (e.target.closest('.delete-transaction')) {
            const transactionItem = e.target.closest('.transaction-item');
            const id = transactionItem.dataset.id;
            if (confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
                try {
                    const response = await fetchAuth(`/Transaccion/${id}`, {
                        method: 'DELETE'
                    });
                    if (response && response.ok) {
                        await loadTransactions();
                        showNotification('Transacción eliminada correctamente', 'success');
                    } else {
                        showNotification('Error al eliminar la transacción', 'error');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showNotification('Error al conectar con el servidor', 'error');
                }
            }
        }
    });

    // Cargar las transacciones al inicializar
    loadTransactions();
}
