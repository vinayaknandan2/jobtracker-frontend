import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000' });

// Automatically inject JWT Token into headers
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const loginUser = async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    const res = await API.post('/token', formData);
    localStorage.setItem('token', res.data.access_token);
    return res.data;
};

export const registerUser = async (email, password) => {
    return await API.post('/register', { 
        email: email, 
        password: password 
    });
};

export const getJobs = () => API.get('/jobs/').then(res => res.data);
export const createJob = (jobData) => API.post('/jobs/', jobData).then(res => res.data);
export const deleteJob = (id) => API.delete(`/jobs/${id}`);