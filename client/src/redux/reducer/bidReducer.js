import {
  BID_LIST,
  ERROR,
  LOADING,
  BID_DETAILS,
  RESET_BID_DETAILS,
  SAVE_BID_REF,
  CANCEL_BID,
} from "../action/types";

const initState = {
  loadingAskStatus: false,
  list: {},
  details: {},
  bidRef: "",
  cancelBidData: {},
};

export function bidReducer(state = initState, action) {
  switch (action.type) {
    case LOADING:
      return {
        ...state,
        loadingAskStatus: true,
      };

    case BID_LIST:
      return {
        ...state,
        list: action.payload,
        loadingAskStatus:false
      };

    case SAVE_BID_REF:
      return {
        ...state,
        bidRef: action.payload,
        loadingAskStatus:false
      };

    case BID_DETAILS:
      return {
        ...state,
        loadingAskStatus: false,
        details: action.payload,
        
      };
      case RESET_BID_DETAILS:
        return {
          ...state,
          loadingAskStatus: false,
          details: {}
          
        };
    case CANCEL_BID:
      return {
        ...state,
        loadingAskStatus: false,
        cancelBidData: action.payload,
      };

    case ERROR:
      return {
        ...state,
        loadingAskStatus: false,
        error: action.payload,
      };

    default:
      return state;
  }
}
