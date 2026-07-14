import { isAxiosError } from 'axios';
import api from '../../api/api';
import type { AppDispatch } from '../../app/store';
import type { ApiResponse } from '../../types/api';
import { homeSectionsRequest, homeSectionsSuccess, homeSectionsFailure, type HomeSections } from './slice';

const extractError = (err: unknown, fallback: string): string =>
  isAxiosError<{ message?: string }>(err) ? err.response?.data?.message ?? fallback : fallback;

export const fetchHomeSections = () => async (dispatch: AppDispatch) => {
  dispatch(homeSectionsRequest());
  try {
    const { data } = await api.get<ApiResponse<HomeSections>>('/mobiles/home-sections');
    dispatch(homeSectionsSuccess(data.data));
    return data.data;
  } catch (error) {
    dispatch(homeSectionsFailure(extractError(error, 'Could not load listings')));
  }
};
