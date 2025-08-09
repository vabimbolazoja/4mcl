import contactService from "../../services/contact-service";
import {
  FETCH_CONTACTS,
  CREATE_CONTACT,
  READ_USER_INFO,
  ERROR,
  FETCH_CONTACT_INFO,
  REMOVE_CONTACT,
} from "./types";
import { error, success } from "../../components/Alert";
import { formatDate, generalErrMsg } from "../../helperFunctions";

export const fetchContact = (type,acc) => async (dispatch) => {
  try {
    const result = await contactService.fetchContact(type,acc);
    dispatch({
      type: FETCH_CONTACTS,
      payload: {
        loading: true,
        success: false,
        data: result,
      },
    });
  } catch (err) {}
};

export const getContactInfo = (contactId) => async (dispatch) => {
  try {
    const result = await contactService.fetchContactInfo(contactId);
    dispatch({
      type: FETCH_CONTACT_INFO,
      payload: {
        loading: true,
        success: false,
        data: result,
      },
    });
  } catch (err) {}
};

export const removeContact = (id) => async (dispatch) => {
  dispatch({
    type: REMOVE_CONTACT,
    payload: {
      loading: true,
      success: false,
    },
  });
  try {
    const result = await contactService.removeContact(id);
    dispatch({
      type: REMOVE_CONTACT,
      payload: {
        loading: false,
        data: result,
        success: true,
      },
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

export const createContact = () => async (dispatch) => {
  try {
    const result = await contactService.createContact();
    dispatch({
      type: CREATE_CONTACT,
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

export const getUserInfo = (phone) => async (dispatch) => {
  dispatch({
    type: READ_USER_INFO,
    payload: {
      loading: true,
    },
  });
  try {
    const result = await contactService.getUserInfo(phone);
    dispatch({
      type: READ_USER_INFO,
      payload: {
        data: result,
        loading: false,
      },
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
