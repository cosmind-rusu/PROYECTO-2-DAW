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
   const logoutBtn = document.getElementById('logoutBtn');
   const totalSpan = document.querySelector('.total-subscriptions .fw-bold');

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

   // Inicializar la carga de suscripciones
   loadSubscriptions();
});