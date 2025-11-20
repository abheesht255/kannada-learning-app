// API Configuration - Uses api-config.js
// This file should be loaded AFTER api-config.js

// Get API URL from configuration
const API_BASE_URL = window.API_URL || 'http://localhost:3000/api';

console.log('📡 API Base URL configured:', API_BASE_URL);

// Simple API request wrapper with proper error handling
async function apiRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    // Add body for POST/PUT requests
    if (data) {
        options.body = JSON.stringify(data);
    }

    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`🌐 ${method} ${endpoint}`, data || '');

    try {
        const response = await fetch(url, options);
        console.log(`📊 Response status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Error ${response.status}:`, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log(`✅ Success`, result);
        return result;
    } catch (error) {
        console.error(`❌ API Error on ${endpoint}:`, error.message);
        throw error;
    }
}

// API namespace
const api = {
    chapters: {
        getAll: () => apiRequest('/chapters'),
        getById: (id) => apiRequest(`/chapters/${id}`),
        create: (data) => apiRequest('/chapters', 'POST', data),
        update: (id, data) => apiRequest(`/chapters/${id}`, 'PUT', data),
        delete: (id) => apiRequest(`/chapters/${id}`, 'DELETE')
    },

    quizzes: {
        getAll: () => apiRequest('/quizzes'),
        getByChapterId: (chapterId) => apiRequest(`/quizzes/chapter/${chapterId}`),
        create: (data) => apiRequest('/quizzes', 'POST', data),
        update: (id, data) => apiRequest(`/quizzes/${id}`, 'PUT', data),
        submit: (chapterId, answers) => {
            console.log(`📝 Submitting answers for chapter ${chapterId}`);
            return apiRequest(`/quizzes/${chapterId}/submit`, 'POST', { answers });
        },
        delete: (id) => apiRequest(`/quizzes/${id}`, 'DELETE')
    },

    results: {
        submit: (data) => apiRequest('/results/submit', 'POST', data),
        getAll: () => apiRequest('/results/all'),
        getByUser: (userId) => apiRequest(`/results/user/${userId}`),
        getStats: () => apiRequest('/results/statistics')
    }
};

window.api = api;
