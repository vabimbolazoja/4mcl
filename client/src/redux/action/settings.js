import session from "redux-persist/lib/storage/session";
import { error, success } from "../../components/Alert";
import { generalErrMsg } from "../../helperFunctions";
import settingsService from "../../services/settings-service";
import {
  ACTIVATE_INSTANT_SETTLEMENT,
  ALL_NOTIFICATIONS,
  APPLY_NOTIFICATION_PREFERENCE,
  EDIT_FRIENDLY_NAME,
  ERROR,
  GET_NOTIFICATION_PREFERENCES,
  GET_NOTIFICATION_PREFERENCE_CHANNELS,
  GET_REFERRALS,
  INITIATE_PASSWORD_RESET,
  INITIATE_PIN_SETUP,
  JOIN_WAITLIST,
  LOADING_SETTINGS,
  LOADING_SETTLEMENT,
  MIGRATE_TO_PAYEE,
  PASSWORD_RESET,
  SET_PIN,
  SUBMIT_MICRO_DEBIT,
  SWITCH_TO_PERSONAL,
} from "./types";
import { fetchLinkedAccounts, fetchProfile } from "./user";

export const sendPinCode = () => async (dispatch) => {
  try {
    const result = await settingsService.initiatePinSetup();
    dispatch({
      type: INITIATE_PIN_SETUP,
      payload: result,
    });
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
  }
};

export const setPin = (details) => async (dispatch) => {
  dispatch({ type: LOADING_SETTINGS });
  try {
    const result = await settingsService.setPin(details);
    dispatch({
      type: SET_PIN,
      payload: result,
    });
    dispatch(fetchProfile());
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const initiatePasswordReset = (email) => async (dispatch) => {
  dispatch({ type: LOADING_SETTINGS });
  try {
    const result = await settingsService.initiatePasswordReset(email);
    dispatch({
      type: INITIATE_PASSWORD_RESET,
      payload: result,
    });
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const passwordReset = (data) => async (dispatch) => {
  dispatch({ type: LOADING_SETTINGS });
  try {
    const result = await settingsService.passwordReset(data);
    dispatch({
      type: PASSWORD_RESET,
      payload: result,
    });
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const fetchAllNotifications = () => async (dispatch) => {
  dispatch({ type: LOADING_SETTINGS });
  try {
    const result = await settingsService.fetchAllNotifications();
    dispatch({
      type: ALL_NOTIFICATIONS,
      payload: result,
    });
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
  }
};

export const activateInstantSettlement = (data) => async (dispatch) => {
  dispatch({ type: LOADING_SETTLEMENT });
  try {
    const result = await settingsService.activateInstantSettlement(data);
    dispatch({
      type: ACTIVATE_INSTANT_SETTLEMENT,
      payload: result,
    });
    dispatch(fetchLinkedAccounts());
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const updateRejectedInstantSettlement = (data) => async (dispatch) => {
  dispatch({ type: LOADING_SETTLEMENT });
  try {
    const result = await settingsService.updateRejectedInstantSettlement(data);
    dispatch({
      type: ACTIVATE_INSTANT_SETTLEMENT,
      payload: result,
    });
    dispatch(fetchLinkedAccounts());
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const submitMicroDebit = (data) => async (dispatch) => {
  dispatch({ type: LOADING_SETTLEMENT });
  try {
    const result = await settingsService.submitMicroDebit(data);
    dispatch({
      type: SUBMIT_MICRO_DEBIT,
      payload: result,
    });
    dispatch(fetchLinkedAccounts());
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const migrateToPayee = (data) => async (dispatch) => {
  dispatch({ type: LOADING_SETTINGS });

  let formData = new FormData();

  formData.append("name", data?.name.trim());
  formData.append("identificationType", data?.identificationType.trim());
  formData.append("identificationNumber", data?.identificationNumber.trim());
  formData.append("role", data?.role.trim());
  formData.append("businessDocument", data?.businessDocument);

  try {
    const result = await settingsService.migrateToPayee(formData);
    dispatch({
      type: MIGRATE_TO_PAYEE,
      payload: result,
    });

    setTimeout(() => {
      window.location.href = "/login";
      sessionStorage.clear();
      localStorage.clear();
    }, 3000);
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const switchToPersonal = () => async (dispatch) => {
  dispatch({ type: LOADING_SETTINGS });

  try {
    const result = await settingsService.switchToPersonal();
    dispatch({
      type: SWITCH_TO_PERSONAL,
      payload: result,
    });

    setTimeout(() => {
      window.location.href = "/login";
      sessionStorage.clear();
      localStorage.clear();
    }, 3000);
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const getReferrals = (query) => async (dispatch) => {
  dispatch({ type: LOADING_SETTINGS });
  try {
    const result = await settingsService.getReferrals(query);
    dispatch({
      type: GET_REFERRALS,
      payload: result,
    });
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
  }
};

export const getNotificationPreferences = () => async (dispatch) => {
  dispatch({ type: LOADING_SETTINGS });
  try {
    const result = await settingsService.getNotificationPreferences();
    dispatch({
      type: GET_NOTIFICATION_PREFERENCES,
      payload: result,
    });
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
  }
};

export const getNotificationPreferenceChannels = () => async (dispatch) => {
  dispatch({ type: LOADING_SETTINGS });
  try {
    const result = await settingsService.getNotificationPreferenceChannels();
    dispatch({
      type: GET_NOTIFICATION_PREFERENCE_CHANNELS,
      payload: result,
    });
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
  }
};

export const applyNotificationPreference = (data) => async (dispatch) => {
  dispatch({ type: LOADING_SETTINGS });
  try {
    const result = await settingsService.applyNotificationPreference(data);
    dispatch({
      type: APPLY_NOTIFICATION_PREFERENCE,
      payload: result,
    });
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
  }
};

export const editFriendlyName = (id, name) => async (dispatch) => {
  dispatch({ type: LOADING_SETTINGS });
  try {
    const result = await settingsService.editFriendlyName(id, name);
    dispatch({
      type: EDIT_FRIENDLY_NAME,
      payload: result,
    });
    dispatch(fetchLinkedAccounts());
    success("Success", "Friendly name edited successfully");
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const joinWaitList = (data) => async (dispatch) => {
  dispatch({ type: LOADING_SETTINGS });
  try {
    const result = await settingsService.joinWaitList(data);
    dispatch({
      type: JOIN_WAITLIST,
      payload: result,
    });
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};
