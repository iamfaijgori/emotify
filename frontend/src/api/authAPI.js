import axiosInstance from './axiosInstance';

export const registerAPI = (data) =>
  axiosInstance.post('/api/auth/register/', data);

export const verifyOTPAPI = (data) =>
  axiosInstance.post('/api/auth/verify-otp/', data);

export const loginAPI = (data) =>
  axiosInstance.post('/api/auth/login/', data);

export const logoutAPI = (data) =>
  axiosInstance.post('/api/auth/logout/', data);

export const forgotPasswordAPI = (data) =>
  axiosInstance.post('/api/auth/forgot-password/', data);

export const resetPasswordAPI = (data) =>
  axiosInstance.post('/api/auth/reset-password/', data);

export const resendOTPAPI = (data) =>
  axiosInstance.post('/api/auth/resend-otp/', data);

export const getMeAPI = () =>
  axiosInstance.get('/api/users/me/');

export const changePasswordAPI = (data) =>
  axiosInstance.post('/api/auth/change-password/', data);