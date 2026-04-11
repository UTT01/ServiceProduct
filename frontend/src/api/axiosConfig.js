import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8087/api/v1', // Trỏ tới cổng của Spring Boot
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;