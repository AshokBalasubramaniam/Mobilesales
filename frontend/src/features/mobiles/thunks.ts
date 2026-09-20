import type { Dispatch } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import api from "../../api/api";
import type { ApiResponse } from "../../types/api";
import type { DeviceCategory } from "../../types/models";
import {
  homeSectionsStart,
  homeSectionsSuccess,
  homeSectionsFail,
  type HomeSections,
} from "./slice";

const extractError = (err: unknown, fallback: string): string =>
  isAxiosError<{ message?: string }>(err)
    ? (err.response?.data?.message ?? fallback)
    : fallback;

export const fetchHomeSections =
  (category?: DeviceCategory) => async (dispatch: Dispatch) => {
    try {
      dispatch(homeSectionsStart());
      const response = await api.get<ApiResponse<HomeSections>>(
        "/mobiles/home-sections",
        { params: category ? { category } : {} },
      );
      if (response.status === 200) {
        dispatch(homeSectionsSuccess(response.data.data));
        return response.data.data;
      }
    } catch (error) {
      dispatch(homeSectionsFail(extractError(error, "Could not load listings")));
    }
  };
