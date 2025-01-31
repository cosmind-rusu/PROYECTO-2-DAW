import auth from './auth.js';

document.addEventListener('DOMContentLoaded', async function() {
   console.log('Dashboard inicializando...');
  
   // Verificar autenticación
   if (!auth.checkAuth()) {
       console.log('No autenticado, redirigiendo...');
       return;
   }

   console.log('Usuario autenticado, token:', auth.getToken());

   // Referencias DOM
   const subscriptionList = document.querySelector('.subscription-list');
   const subscriptionForm = document.getElementById('subscriptionForm');
   const transactionList = document.querySelector('.transaction-list');
   const transactionForm = document.getElementById('transactionForm');
   const logoutBtn = document.getElementById('logoutBtn');
   const totalSpan = document.querySelector('.total-subscriptions .fw-bold');
   const balanceSpan = document.querySelector('.total-balance .fw-bold');

   // Configuración base para fetch
   const BASE_URL = 'http://localhost:5230/api';
   
   // Función auxiliar para realizar peticiones autenticadas
   async function fetchAuth(endpoint, options = {}) {
       const token = auth.getToken();
       console.log('Token usado en fetchAuth:', token);

       if (!token) {
           console.log('No hay token disponible');
           auth.logout();
           return null;
       }

       try {
           const headers = {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json',
               ...options.headers
           };

           console.log('Headers de la petición:', headers);

           const response = await fetch(`${BASE_URL}${endpoint}`, {
               ...options,
               headers
           });

           console.log('Respuesta:', response.status, response.statusText);

           if (response.status === 401) {
               console.log('Error de autenticación');
               auth.logout();
               return null;
           }

           return response;
       } catch (error) {
           console.error('Error en la petición:', error);
           return null;
       }
   }

   // Cargar suscripciones
   async function loadSubscriptions() {
       try {
           const response = await fetchAuth('/Suscripcion');
           
           if (response && response.ok) {
               const suscripciones = await response.json();
               console.log('Suscripciones cargadas:', suscripciones);
               displaySubscriptions(suscripciones);
           }
       } catch (error) {
           console.error('Error al cargar suscripciones:', error);
           showNotification('Error al cargar las suscripciones', 'error');
       }
   }

   // Mostrar suscripciones
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

   // Cargar transacciones
   async function loadTransactions() {
       try {
           const response = await fetchAuth('/Transaccion');
           
           if (response && response.ok) {
               const transacciones = await response.json();
               console.log('Transacciones cargadas:', transacciones);
               displayTransactions(transacciones);
           }
       } catch (error) {
           console.error('Error al cargar transacciones:', error);
           showNotification('Error al cargar las transacciones', 'error');
       }
   }

   // Mostrar transacciones
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

       // Ordenar transacciones por fecha, más recientes primero
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

   // Manejar el formulario de nueva suscripción
   subscriptionForm.addEventListener('submit', async function(e) {
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

   // Manejar el formulario de nueva transacción
   transactionForm.addEventListener('submit', async function(e) {
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

   // Eliminar suscripción
   subscriptionList.addEventListener('click', async function(e) {
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

   // Eliminar transacción
   transactionList.addEventListener('click', async function(e) {
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

   // Mostrar notificaciones
   function showNotification(message, type = 'info') {
       alert(message);
   }

   // Manejar cierre de sesión
   logoutBtn.addEventListener('click', function(e) {
       e.preventDefault();
       console.log('Cerrando sesión...');
       auth.logout();
   });

   // Inicializar cargas
   loadSubscriptions();
   loadTransactions();
});