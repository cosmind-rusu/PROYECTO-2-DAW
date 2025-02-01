
import auth from './auth.js';

const BASE_URL = '/api';

export async function fetchAuth(endpoint, options = {}) {
    const token = auth.getToken();
    if (!token) {
        auth.logout();
        return null;
    }

    try {
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        };

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        if (response.status === 401) {
            auth.logout();
            return null;
        }

        return response;
    } catch (error) {
        console.error('Error en la petición:', error);
        return null;
    }
}
