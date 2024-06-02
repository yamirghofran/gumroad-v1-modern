// api.js
import axios from 'axios';

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

import { useQuery } from "react-query";

const fetchUserFunction = async () => {
  const response = await api.get('user');
  return response.data.user;
}

export const fetchUser = () => {
  return useQuery('user', fetchUserFunction);
}

const fetchUserLinksFunction = async () => {
  const response = await api.get('links');
  return response.data.links;
}

export const fetchUserLinks = () => {
  return useQuery('links', fetchUserLinksFunction);
}

const fetchUserLinkFunction = async (linkId) => {
  const response = await api.get(`links/${linkId}`);
  return response.data.link;
}

export const fetchUserLink = (linkId) => {
  return useQuery(['user-link', linkId], () => fetchUserLinkFunction(linkId));
}

const fetchPurchaseLinkFunction = async (url) => {
  const response = await axios.get(`http://localhost:3000/l/${url}`);
  return response.data.link;
}

export const fetchPurchaseLink = (url) => {
  return useQuery(['purchase-link', url], () => fetchPurchaseLinkFunction(url));
}