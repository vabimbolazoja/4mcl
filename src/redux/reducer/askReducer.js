import {
  ERROR,
  LOADING,
  ADD_ASK,
  ADD_CURRENT_ASK,
  OTHER_ASK_DATA,
  SUCCESS_CREATED_ASK,
  SUCCESS_EDITED_ASK,
  BUY_ASK,
  RESET_BIDS,
  CANCEL_ASK,
  EDIT_ASK_INFO,
  ASK_SUGGESTIONS,
  BID_REJECTED,
  BID_ACCEPTED,
  RATE_LIMIT,
  ASK_ERROR,
  BID_ERROR,
  ASK_LIMIT,
  BIDDINGS_ON_ASK,
  MY_ASK_DATA,
  GET_BID_FEE,
  BID_ASK,
} from "../action/types";

const initState = {
  loadingAsk: false,
  ask: {},
  currentAsk: {},
  createdAskStatus: {},
  editedAskStatus: {},
  myAsksData: {},
  askCancelled: {},
  biddingDatas: {},
  bidType: false,
  bidRejected: {},
  bidAccepted: {},
  otherAskData: {},
  bidAskFee: {},
  bidAsk: {},
  buyAsk: {},
  editAskInfos: {},
  askError: false,
  rateLimit: {},
  bidError: false,
  askLimit: {},
  suggestions: {},
};

export function askReducer(state = initState, action) {
  switch (action.type) {
    case LOADING:
      return {
        ...state,
        loadingAsk: true,
        error: {},
        bidError: false,
        askError: false,
      };
    case ADD_ASK:
      return {
        ...state,
        loadingAsk: false,
        ask: action.payload,
        error: {},
        bidError: false,
        askError: false,
      };
    case RATE_LIMIT:
      return {
        ...state,
        loadingAsk: false,
        rateLimit: action.payload,
        error: {},
        bidError: false,
        askError: false,
      };
    case ADD_CURRENT_ASK:
      // console.log('time')
      return {
        ...state,
        loadingAsk: false,
        currentAsk: action.payload,
        error: {},
        bidError: false,
        askError: false,
      };
    case SUCCESS_CREATED_ASK:
      return {
        ...state,
        loadingAsk: false,
        createdAskStatus: action.payload,
        error: false,
        editedAskStatus: {},
        bidError: false,
        askError: false,
      };
    case SUCCESS_EDITED_ASK:
      return {
        ...state,
        loadingAsk: false,
        createdAskStatus: {},
        editedAskStatus: action.payload,
        bidError: false,
        askError: false,

        error: false,
      };
    case MY_ASK_DATA:
      return {
        ...state,
        loadingAsk: false,
        myAsksData: action.payload,
        error: {},
        askError: false,
      };
    case OTHER_ASK_DATA:
      return {
        ...state,
        loadingAsk: false,
        otherAskData: action.payload,
        error: {},
        askError: false,
      };
    case CANCEL_ASK:
      return {
        ...state,
        loadingAsk: false,
        askCancelled: action.payload,
        bidError: false,
        askError: false,
      };
    case ASK_SUGGESTIONS:
      return {
        ...state,
        loadingAsk: false,
        suggestions: action.payload,
        askCancelled: action.payload,
        bidError: false,
        askError: false,
      };
    case GET_BID_FEE:
      return {
        ...state,
        loadingAsk: false,
        bidAskFee: action.payload.data,
        bidType: action.payload.type,
        biddingDatas: {},
        error: {},
        bidError: false,
        askError: false,
      };
    case BID_ASK:
      return {
        ...state,
        loadingAsk: false,
        bidAsk: action.payload,
        biddingDatas: {},
        error: {},
        askError: false,
      };
    case BID_REJECTED:
      return {
        ...state,
        loadingAsk: false,
        bidRejected: action.payload,
        bidAccepted: {},
        error: {},
        bidError: false,
        askError: false,
      };
    case BID_ACCEPTED:
      return {
        ...state,
        loadingAsk: false,
        bidAccepted: action.payload,
        bidRejected: {},
        error: {},
        bidError: false,
        askError: false,
      };
    case BUY_ASK:
      return {
        ...state,
        loadingAsk: false,
        buyAsk: action.payload,
        biddingDatas: {},
        error: {},
        askError: false,
      };
    case BIDDINGS_ON_ASK:
      return {
        ...state,
        loadingAsk: false,
        biddingDatas: action.payload,
        error: {},
        bidError: false,
        askError: false,
      };
    case RESET_BIDS:
      return {
        ...state,
        loadingAsk: false,
        biddingDatas: {},
        error: {},
        bidError: false,
        askError: false,
      };

    case EDIT_ASK_INFO:
      return {
        ...state,
        loadingAsk: false,
        editAskInfos: action.payload,
        error: {},
        bidError: false,
        askError: false,
      };

    case ERROR:
      return {
        ...state,
        loadingAsk: false,
        error: action.payload,
        bidError: false,
        askError: false,
      };
    case ASK_ERROR:
      return {
        ...state,
        loadingAsk: false,
        askError: action.payload,
      };
    case BID_ERROR:
      return {
        ...state,
        loadingAsk: false,
        bidError: action.payload,
      };
    case ASK_LIMIT:
      return {
        ...state,
        loadingAsk: false,
        askLimit: action.payload,
      };
    default:
      return state;
  }
}

export default askReducer;
