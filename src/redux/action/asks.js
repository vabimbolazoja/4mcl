import askService from "../../services/ask-service";
import { error } from "../../components/Alert";
import {
  ERROR,
  LOADING,
  ADD_CURRENT_ASK,
  SUCCESS_CREATED_ASK,
  SUCCESS_EDITED_ASK,
  MY_ASK_DATA,
  OTHER_ASK_DATA,
  CANCEL_ASK,
  RESET_BIDS,
  ASK_SUGGESTIONS,
  EDIT_ASK_INFO,
  RATE_LIMIT,
  BID_REJECTED,
  ASK_ERROR,
  BID_ERROR,
  ASK_LIMIT,
  BID_ACCEPTED,
  BUY_ASK,
  BIDDINGS_ON_ASK,
  GET_BID_FEE,
  BID_ASK,
} from "./types";
import { generalErrMsg } from "../../helperFunctions";

export const createAsk = (askData) => async (dispatch) => {
  dispatch({ type: LOADING });
  const data = {
    haveCurrency: askData.haveCurrency,
    haveAmount: askData.haveAmount,
    askFee: askData.askFee,
    needCurrency: askData.needCurrency,
    needAmount: askData.needAmount,
    rate: askData.rate,
    fraction: askData.fraction,
    channel: "WEB",
  };
  try {
    const result = await askService.createAsk(data);
    if (result) {
      const askDetails = {
        ...askData,
        askCreated: result,
      };
      dispatch({
        type: SUCCESS_CREATED_ASK,
        payload: askDetails,
      });
    }
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ASK_ERROR,
      payload: message || generalErrMsg,
    });
    // error("Error!", message || generalErrMsg);
  }
};
export const editAsk = (askData) => async (dispatch) => {
  dispatch({ type: LOADING });
  const data = {
    haveAmount: askData.haveAmount,
    askFee: askData.askFee,
    needAmount: askData.needAmount,
    rate: askData.rate,
    fraction: askData.fraction,
    channel: "WEB",
    ref: askData.reference,
  };
  try {
    const result = await askService.editAsk(data);
    if (result) {
      const askDetails = {
        ...askData,
        askEdited: result,
      };
      dispatch({
        type: SUCCESS_EDITED_ASK,
        payload: askDetails,
      });
    }
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};
export const getAskFee = (askData) => async (dispatch) => {
  dispatch({ type: LOADING });
  try {
    const feeData = {
      amount: askData.haveAmount,
      currency: askData.haveCurrency,
    };
    const result = await askService.getAskFee(feeData);
    const askDetails = {
      ...askData,
      askFee: result?.fee,
    };
    dispatch({
      type: ADD_CURRENT_ASK,
      payload: askDetails,
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
export const getSuggestions = (askData) => async (dispatch) => {
  try {
    const result = await askService.getSuggestions(askData);
    dispatch({
      type: ASK_SUGGESTIONS,
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
export const getRateLimit = (askData) => async (dispatch) => {
  try {
    const result = await askService.getRate(askData);
    dispatch({
      type: RATE_LIMIT,
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
export const skipSuggestions = () => async (dispatch) => {
  console.log('skip suggestions')
  dispatch({
    type: ASK_SUGGESTIONS,
    payload: [],
  });
};
export const getBidFee = (askData) => async (dispatch) => {
  dispatch({ type: LOADING });
  try {
    const feeData = {
      amount: askData.bidAmount,
      currency: askData.currency,
    };
    const result = await askService.getBidFee(feeData);
    const feeDetails = {
      ...askData,
      bidFee: result?.fee,
    };
    dispatch({
      type: GET_BID_FEE,
      payload: {
        data: feeDetails,
        type: askData.type,
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
export const bidAsk = (bidData) => async (dispatch) => {
  dispatch({ type: LOADING });
  try {
    const result = await askService.bidAsk(bidData);
    const bidDataDetails = {
      ...bidData,
      bidAskInfo: result,
    };
    dispatch({
      type: BID_ASK,
      payload: bidDataDetails,
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

export const buyAsk = (buyData) => async (dispatch) => {
  dispatch({ type: LOADING });
  try {
    const result = await askService.buyAsk(buyData);
    const buyDataDetails = {
      ...buyData,
      buyAskInfo: result,
    };
    dispatch({
      type: BUY_ASK,
      payload: buyDataDetails,
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
export const cancelCreatedAsk = (askRef) => async (dispatch) => {
  dispatch({ type: LOADING });
  try {
    const result = await askService.cancelAsk(askRef);
    const askDetails = {
      ...askRef,
      askInfo: result,
    };
    dispatch({
      type: CANCEL_ASK,
      payload: askDetails,
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
export const getMyAsk = (queryString) => async (dispatch) => {
  dispatch({ type: LOADING });
  try {
    const result = await askService.getMyAsk(queryString);
    dispatch({
      type: MY_ASK_DATA,
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
export const getOtherAsk = (queryString) => async (dispatch) => {
  dispatch({ type: LOADING });
  try {
    const result = await askService.getOtherAsk(queryString);

    dispatch({
      type: OTHER_ASK_DATA,
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

export const getAskBiddings = (askData) => async (dispatch) => {
  dispatch({ type: LOADING });
  try {
    const result = await askService.getBiddings(askData);
    if (result.records.length > 0) {
      const askBiddings = {
        ...askData,
        bidsAskData: result?.records,
      };
      dispatch({
        type: BIDDINGS_ON_ASK,
        payload: askBiddings,
      });
    } else {
      error("Error!", "No Bids Available Yet");
      dispatch({
        type: ERROR,
        payload: "",
      });
    }
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
  }
};

export const acceptBid = (askData) => async (dispatch) => {
  dispatch({ type: LOADING });
  try {
    const result = await askService.acceptBid(askData);
    const askBid = {
      ...askData,
      bidAccepted: result,
    };
    dispatch({
      type: BID_ACCEPTED,
      payload: askBid,
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

export const rejectBid = (askData) => async (dispatch) => {
  dispatch({ type: LOADING });
  try {
    const result = await askService.rejectBid(askData);
    const askBid = {
      ...askData,
      bidRejected: result,
    };
    dispatch({
      type: BID_REJECTED,
      payload: askBid,
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

export const getAskLimit = () => async (dispatch) => {
  try {
    const result = await askService.askLimit();
    dispatch({
      type: ASK_LIMIT,
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

export const editAskInfo = (askData) => async (dispatch) => {
  dispatch({ type: EDIT_ASK_INFO, payload: askData });
};

export const resetAskBiddings = () => async (dispatch) => {
  dispatch({ type: RESET_BIDS });
};
