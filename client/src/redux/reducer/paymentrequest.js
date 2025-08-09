import {
  PAYMENT_REQUEST_LIST,
  PAYMENT_DETAILS,
  PAYMENT_REQUEST_LOADING,
  SAVED_PAYMENT_REQUEST,LOADING_PAYMENT_REQUEST,
} from "../action/types";

const initState = {
  paymentList: [],
  paymentDetails: {},
  loading: false,
  savedRequest: {},
};

export function paymentRequestReducer(state = initState, action) {
  switch (action.type) {
    case PAYMENT_REQUEST_LIST:
      return {
        ...state,
        paymentList: action.payload,
      };
    case PAYMENT_DETAILS:
      return {
        ...state,
        paymentDetails: action.payload,
      };
    case PAYMENT_REQUEST_LOADING:
      return {
        ...state,
        loading: false,
      };
    case SAVED_PAYMENT_REQUEST:
      return {
        ...state,
        savedRequest: action.payload,
      };
    case LOADING_PAYMENT_REQUEST:
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
}
