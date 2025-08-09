import {
  WALLET,
  COUNTRY,
  ASKS,
  BIDS,
  GET_STARTED,
  BASE_CONFIGS,
  GET_PRESETS,
  GET_READCHAT,
  REFRESH,
  CHAT_DATA,
  TRANSACTION_STATUS,
  READ_CHAT,
  NEW_MSG,
  BLOGS,
  SET_PICTURE,
  EXCHANGE_STATUS,
  ADD_USER_CHAT,
} from "./types";
import axios from "axios";
import config from "../../config";

export const walletChange = (wallet) => (dispatch) => {
  dispatch({
    type: WALLET,
    payload: wallet,
  });
};

export const saveUserPic = (picture) => (dispatch) => {
  dispatch({
    type: SET_PICTURE,
    payload: picture,
  });
};

export const saveCountry = (country) => (dispatch) => {
  dispatch({
    type: COUNTRY,
    payload: country,
  });
};

export const getStarted = (email) => (dispatch) => {
  dispatch({
    type: GET_STARTED,
    payload: email,
  });
};

export const cancelEmail = () => (dispatch) => {
  dispatch({
    type: GET_STARTED,
    payload: null,
  });
};

export const getBidStatus = () => (dispatch) => {
  axios
    .get(`${config.exchangeUrl}/api/v1/bid/statuses`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    })
    .then((res) => {
      if (res.data) {
        dispatch({
          type: BIDS,
          payload: res.data,
        });
      } else {
      }
    })
    .catch((err) => {
      if (err) {
      }
    });
};
export const getBlogs = () => (dispatch) => {
  axios
    .get(
      `${config.baseUrl}/api/v1/blogs?pageSize=10&pageNumber=1&blogStatus=ACTIVE&title=&startDate=&endDate=`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    )
    .then((res) => {
      if (res?.data) {
        dispatch({
          type: BLOGS,
          payload: res?.data,
        });
      } else {
      }
    })
    .catch((err) => {
      if (err) {
      }
    });
};

export const getTransactionStatus = () => (dispatch) => {
  axios
    .get(`${config.baseUrl}/api/v1/configurations`)
    .then((res) => {
      if (res.data) {
        dispatch({
          type: TRANSACTION_STATUS,
          payload: res.data.transactionStatuses,
        });
      } else {
      }
    })
    .catch((err) => {
      if (err) {
      }
    });
};

export const getExchangeStatus = () => (dispatch) => {
  axios
    .get(`${config.baseUrl}/api/v1/configurations`)
    .then((res) => {
      if (res.data) {
        dispatch({
          type: EXCHANGE_STATUS,
          payload: res.data.exchangeStatuses,
        });
      } else {
      }
    })
    .catch((err) => {
      if (err) {
      }
    });
};

export const baseConfigs = () => (dispatch) => {
  axios
    .get(`${config.baseUrl}/api/v1/configurations`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    })
    .then((res) => {
      if (res.data) {
        dispatch({
          type: BASE_CONFIGS,
          payload: res.data,
        });
      }
    })
    .catch((err) => {
      if (err) {
      }
    });
};

export const getAskStatus = () => (dispatch) => {
  axios
    .get(`${config.exchangeUrl}/api/v1/ask/statuses`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    })
    .then((res) => {
      if (res.data) {
        dispatch({
          type: ASKS,
          payload: res.data,
        });
      }
    })
    .catch((err) => {
      if (err) {
      }
    });
};

//CHATS
export const getPresets = () => (dispatch) => {
  dispatch({
    type: GET_PRESETS,
    payload: null,
  });
};

export const readChat = (user) => (dispatch) => {
  dispatch({
    type: READ_CHAT,
    payload: user,
  });
};

export const getReadChat = (user) => (dispatch) => {
  dispatch({
    type: GET_READCHAT,
    payload: null,
  });
};

export const addNewMsg = (user, msg) => (dispatch) => {
  dispatch({
    type: NEW_MSG,
    payload: {
      msg: msg,
      user: user,
    },
  });
};

export const addUserChat = (user) => (dispatch) => {
  axios
    .post(
      `${config.baseUrl}/api/v1/notification`,
      {
        message: "Hello" + " " + user,
        to: user,
      },
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    )
    .then((res) => {
      if (res.status === 200) {
        dispatch({
          type: ADD_USER_CHAT,
          payload: true,
        });
      }
    })
    .catch((err) => {
      if (err) {
      }
    });
};

export const getChatData = () => (dispatch) => {
  dispatch({
    type: REFRESH,
    payload: {
      refreshStatus: true,
    },
  });

  dispatch({
    type: GET_PRESETS,
    payload: null,
  });
  axios
    .get(`${config.baseUrl}/api/v1/notification/`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    })
    .then((res) => {
      if (res.data) {
        dispatch({
          type: CHAT_DATA,
          payload: res.data,
        });
        dispatch({
          type: REFRESH,
          payload: {
            refreshStatus: false,
          },
        });
      } else {
      }
    })
    .catch((err) => {
      if (err) {
      }
    });
};
