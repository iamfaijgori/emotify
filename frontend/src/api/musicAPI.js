import axiosInstance from './axiosInstance';

export const searchMusicAPI = (query) =>
  axiosInstance.get(`/api/music/search/?q=${query}&source=youtube`);

export const parseIntentAPI = (text) =>
  axiosInstance.post('/api/ai/parse-intent/', { text });

export const getMoodSongsAPI = (mood) =>
  axiosInstance.get(`/api/ai/mood/?mood=${mood}`);

export const logPlayAPI = (data) =>
  axiosInstance.post('/api/music/log/', data);

export const getHistoryAPI = () =>
  axiosInstance.get('/api/music/history/');

export const getFavouritesAPI = () =>
  axiosInstance.get('/api/music/favourites/');

export const addFavouriteAPI = (song) =>
  axiosInstance.post('/api/music/favourites/', { song });

export const removeFavouriteAPI = (song_id) =>
  axiosInstance.delete('/api/music/favourites/', { data: { song_id } });

export const updateProfileAPI = (formData) =>
  axiosInstance.patch('/api/users/me/update/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });