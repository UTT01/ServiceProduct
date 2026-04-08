import axios from 'axios';

const apiStore = axios.create({
    baseURL: 'http://localhost:8081/api/v1', // Trỏ tới cổng 8081 của ServiceStore
    headers: {
        'Content-Type': 'application/json'
    }
});

export default apiStore;