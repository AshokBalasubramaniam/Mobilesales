import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type UserGroupState = {
  sucessMessage: string;
  failureMessage: string;
  userGroupData: unknown[];
  viewData: unknown[];
  departmentDesignationData: unknown[];
  locationData: unknown[];
  userDepartmentData: unknown[];
  userGroupExcelSheetUpdateData: unknown[];
  hrMasterLocationData: unknown[];
  userGroupList: unknown[];
  isGroupNameExist: boolean;
  errorMessage: string;
};

const initialState: UserGroupState = {
  sucessMessage: '',
  failureMessage: '',
  userGroupData: [],
  viewData: [],
  departmentDesignationData: [],
  locationData: [],
  userDepartmentData: [],
  userGroupExcelSheetUpdateData: [],
  hrMasterLocationData: [],
  userGroupList: [],
  isGroupNameExist: false,
  errorMessage: '',
};

const userGroupSlice = createSlice({
  name: 'userGroup',
  initialState,
  reducers: {
    fetchaddUserGroupSuccess: (state, action: PayloadAction<string>) => {
      state.sucessMessage = action.payload;
    },
    errMessage: (state, action: PayloadAction<string>) => {
      state.failureMessage = action.payload;
    },
    fetchUserGroupSuccess: (state, action: PayloadAction<unknown[]>) => {
      state.userGroupData = action.payload;
    },
    deleteUsrGroupRequest: (state) => {
      state.failureMessage = '';
    },
    deleteUserGroupSuccess: (state, action: PayloadAction<string>) => {
      state.sucessMessage = action.payload;
    },
    deleteUserGroupFailure: (state, action: PayloadAction<string>) => {
      state.failureMessage = action.payload;
    },

    ViewuserGroups: (state, action: PayloadAction<unknown[]>) => {
      state.viewData = action.payload;
    },
    userGroupDataReset: (state) => {
      state.viewData = [];
    },
    fetchUpdateUserGroupSuccess: (state, action: PayloadAction<string>) => {
      state.sucessMessage = action.payload;
    },
    fetchDepartmentDesignationSuccess: (state, action: PayloadAction<unknown[]>) => {
      state.departmentDesignationData = action.payload;
    },
    fetchLocationSuccess: (state, action: PayloadAction<unknown[]>) => {
      state.locationData = action.payload;
    },
    fetchHrMasterLocationSuccess: (state, action: PayloadAction<unknown[]>) => {
      state.hrMasterLocationData = action.payload;
    },
    fetchUserDepartmentSuccess: (state, action: PayloadAction<unknown[]>) => {
      state.userDepartmentData = action.payload;
    },
    postFileDataSuccess: (state, action: PayloadAction<unknown[]>) => {
      state.userGroupExcelSheetUpdateData = action.payload;
    },
    fetchUserGroupExcelSheetDataSuccess: (state, action: PayloadAction<unknown[]>) => {
      state.userGroupExcelSheetUpdateData = action.payload;
    },
    postProvisionedSuccess: (state, action: PayloadAction<string>) => {
      state.sucessMessage = action.payload;
    },
    closeSuccessMessage: (state) => {
      state.sucessMessage = '';
      state.failureMessage = '';
    },
    fetchUserGroupDataSuccess: (state, action: PayloadAction<unknown[]>) => {
      state.userGroupList = action.payload;
    },
    validateGroupNameSuccess: (state) => {
      state.isGroupNameExist = false;
      state.errorMessage = '';
    },
    validateGroupNameFailure: (state, action: PayloadAction<string>) => {
      state.isGroupNameExist = true;
      state.errorMessage = action.payload;
    },
  },
});

export const {
  fetchaddUserGroupSuccess,
  errMessage,
  fetchUserGroupSuccess,
  deleteUsrGroupRequest,
  deleteUserGroupSuccess,
  deleteUserGroupFailure,
  ViewuserGroups,
  userGroupDataReset,
  fetchUpdateUserGroupSuccess,
  fetchDepartmentDesignationSuccess,
  fetchLocationSuccess,
  fetchUserDepartmentSuccess,
  fetchUserGroupExcelSheetDataSuccess,
  postProvisionedSuccess,
  closeSuccessMessage,
  fetchHrMasterLocationSuccess,
  fetchUserGroupDataSuccess,
  postFileDataSuccess,
  validateGroupNameSuccess,
  validateGroupNameFailure,
} = userGroupSlice.actions;
export default userGroupSlice.reducer;
