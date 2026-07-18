import type { RootState } from "../../app/store";

export const selectSuccessMessage = (state: RootState) =>
  state.userGroup.sucessMessage;
export const selectFailureMessage = (state: RootState) =>
  state.userGroup.failureMessage;
export const selectUserGroupData = (state: RootState) =>
  state.userGroup.userGroupData;
export const selectViewData = (state: RootState) => state.userGroup.viewData;
export const selectDepartmentDesignationData = (state: RootState) =>
  state.userGroup.departmentDesignationData;
export const selectLocationData = (state: RootState) =>
  state.userGroup.locationData;
export const selectUserDepartmentData = (state: RootState) =>
  state.userGroup.userDepartmentData;
export const selectUserGroupExcelSheetUpdateData = (state: RootState) =>
  state.userGroup.userGroupExcelSheetUpdateData;
export const selectHrMasterLocationData = (state: RootState) =>
  state.userGroup.hrMasterLocationData;
export const selectUserGroupList = (state: RootState) =>
  state.userGroup.userGroupList;
export const selectIsGroupNameExist = (state: RootState) =>
  state.userGroup.isGroupNameExist;
export const selectErrorMessage = (state: RootState) =>
  state.userGroup.errorMessage;
