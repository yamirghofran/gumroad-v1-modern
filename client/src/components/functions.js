// api.js
import axios from 'axios';
import { toast } from 'sonner';
// Create an Axios instance
const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Add a request interceptor
api.interceptors.request.use(
  config => {
    // Get the token from local storage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);


async function createLink({name, permalink, price, url, files}) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('permalink', permalink);
    formData.append('price', price);
    formData.append('url', url);
  
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
  
    try {
      const response = await api.post('http://localhost:3000/create-link', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Link created successfully:', response.data);
    toast.success('Link created successfully');
    window.location.href = `/links/${response.data.link._id}`;
    } catch (error) {
      console.error('Error creating link:', error.response ? error.response.data : error.message);
    }
  }

async function deleteLink(linkId) {
  try {
    const response = await api.delete(`http://localhost:3000/links/${linkId}`);
    console.log('Link deleted successfully:', response.data);
    toast.success('Link deleted successfully');
  } catch (error) {
    console.error('Error deleting link:', error.response ? error.response.data : error.message);
  }
}

async function updateLink(linkId, name, price ) {
  try {
    const response = await api.put(`http://localhost:3000/links/${linkId}`, { name, price });
    console.log('Link updated successfully:', response.data);
    toast.success('Link updated successfully');
  } catch (error) {
    console.error('Error updating link:', error.response ? error.response.data : error.message);
  }
}



export { createLink, deleteLink, updateLink };