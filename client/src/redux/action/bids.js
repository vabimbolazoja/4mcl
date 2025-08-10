import { error } from "../../components/Alert";
import { generalErrMsg } from "../../helperFunctions";
import bidService from "../../services/bid-service";
import { ERROR, LOADING_BIDS,LOADING, BID_LIST, BID_DETAILS, SAVE_BID_REF, CANCEL_BID, RESET_BID_DETAILS } from "./types";

export const fetchBids = (query) => async (dispatch) => {
  // dispatch({
  //   type: BID_LIST,
  //   payload: {},
  // });
  dispatch({ type: LOADING });

  try {
    const result = await bidService.fetchBids(query);
    dispatch({
      type: BID_LIST,
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

export const fetchBidDetails = (id) => async (dispatch) => {
  dispatch({
    type: BID_DETAILS,
    payload: {},
  });

  try {
    const result = await bidService.fetchBidDetails(id);
    dispatch({
      type: BID_DETAILS,
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

export const resetBidDetails = (id) => async (dispatch) => {
  dispatch({
    type: RESET_BID_DETAILS,
  });

  
};

export const saveBidRef = (ref) => async (dispatch) => {
  dispatch({ type: SAVE_BID_REF, payload: ref });

};


export const cancelBid = (ref) => async (dispatch) => {
  dispatch({
    type: CANCEL_BID,
    payload: {},
  });
  dispatch({ type: LOADING });

  try {
    const result = await bidService.cancelBid(ref);
    dispatch({
      type: CANCEL_BID,
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