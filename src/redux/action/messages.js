import { error } from "../../components/Alert";
import { generalErrMsg } from "../../helperFunctions";
import messageService from "../../services/message-service";
import {
  ERROR,
  LOADING_MESSAGES,
  MESSAGES,
  ADD_MESSAGE,
  READ_MESSAGE,
  IS_READ,
} from "./types";

export const fetchMessages = (type, query) => async (dispatch) => {
  try {
    const result = await messageService.fetchMessages(type, query);
    dispatch({
      type: MESSAGES,
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

export const refreshMessages = (type, query) => async (dispatch) => {
  try {
    const result = await messageService.fetchMessages(type, query);
    dispatch({
      type: MESSAGES,
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

export const readChat = (user) => async (dispatch) => {
  dispatch({
    type: READ_MESSAGE,
    payload: user,
  });
  const data = {
    participator: user,
  };
  try {
    const result = await messageService.readMessage(data);
    const messageRead = {
      isRead: true,
    };
    dispatch({
      type: IS_READ,
      payload: messageRead,
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

export const ratePreset = (msg, currenctChatter) => async (dispatch) => {
  const data = {
    message: msg,
    to: currenctChatter,
  };
  try {
    const result = await messageService.addMessage(data);
    dispatch({
      type: ADD_MESSAGE,
      payload: {
        msg: data.message,
        user: data.to
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

export const fulfillPreset = (msg, currenctChatter) => async (dispatch) => {
  const data = {
    message: msg,
    to: currenctChatter,
  };
  try {
   
    const result = await messageService.addMessage(data);
    dispatch({
      type: ADD_MESSAGE,
      payload: {
        msg: data.message,
        user: data.to
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

export const increasePreset = (msg, currenctChatter) => async (dispatch) => {
  const data = {
    message: msg,
    to: currenctChatter,
  };
  try {
 
    const result = await messageService.addMessage(data);
    dispatch({
      type: ADD_MESSAGE,
      payload: {
        msg: data.message,
        user: data.to
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

export const defaultPreset = (msg, currenctChatter) => async (dispatch) => {
  const data = {
    message: msg,
    to: currenctChatter,
  };
  try {
 
    const result = await messageService.addMessage(data);
    dispatch({
      type: ADD_MESSAGE,
      payload: {
        msg: data.message,
        user: data.to
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

export const addchat = (user) => async (dispatch) => {
  const data = {
    message: "Hello" + " " + user,
    to: user,
  };
  try {
    const result = await messageService.addChatInstance(data);
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};
