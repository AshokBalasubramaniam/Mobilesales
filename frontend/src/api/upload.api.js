import axiosClient from './axiosClient';

export const uploadApi = {
  uploadImage: (file) => {
    const form = new FormData();
    form.append('image', file);
    return axiosClient.post('/upload/image', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};
