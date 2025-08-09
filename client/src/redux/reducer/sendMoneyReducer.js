import {
  ERROR,
  LOOKUP_ACCOUNT,
  INTRA_BANK_TRANSFER,
  RESET_LOOK_UP,
  ACH_TYPES,
  LOADING,
  RESET_VGS,
  DEBIT_CARD_PUSH,
  LOADING_SEND_MONEY,
  INVOKE_VGS,
  RESET_STATUS,
  GET_KUDA_BANKS,
  LOOKUP_ACCOUNT_KUDA,
  LOOKUP_ACCOUNT_USD,
  USD_INTRA_BANK_TRANSFER,
} from "../action/types";

const initState = {
  loading: false,
  lookupData: {},
  success: false,
  achType: [],
  vgsLoadUp: false,
  intrabankTransferData: {},
  usdIntrabankTransferData: {},
  kudaAccountLookup: {},
  kudabanks: {},
  error: {},
  usdAccountLookup: {},
};

export function sendMoneyReducer(state = initState, action) {
  switch (action.type) {
    case LOADING:
      console.log(action);
      return {
        ...state,
        loading: action.payload,
        success: false,
      };

    case LOOKUP_ACCOUNT:
      return {
        ...state,
        loading: false,
        success: false,
        lookupData: action.payload,
      };

    case INVOKE_VGS:
      return {
        ...state,
        loading: false,
        success: false,
        vgsLoadUp: action.payload,
      };

    case GET_KUDA_BANKS:
      return {
        ...state,
        loading: false,
        success: false,
        kudabanks: action.payload,
      };

    case RESET_VGS:
      return {
        ...state,
        loading: false,
        success: false,
        vgsLoadUp: false,
      };
    case LOOKUP_ACCOUNT_KUDA:
      return {
        ...state,
        loading: false,
        success: false,
        vgsLoadUp: false,
        kudaAccountLookup: action.payload,
      };
    case LOOKUP_ACCOUNT_USD:
      return {
        ...state,
        loading: false,
        success: false,
        vgsLoadUp: false,
        usdAccountLookup: action.payload,
      };
    case ACH_TYPES:
      return {
        ...state,
        achType: action.payload.data,
      };

    case LOADING_SEND_MONEY:
      return {
        ...state,
        loading: action.payload,
      };

    case INTRA_BANK_TRANSFER:
      return {
        ...state,
        loading: false,
        intrabankTransferData: action.payload,
        success: action.success,
      };

    case USD_INTRA_BANK_TRANSFER:
      return {
        ...state,
        loading: false,
        usdIntrabankTransferData: action.payload,
        success: action.success,
      };

    case RESET_STATUS:
      return {
        ...state,
        loading: false,
        success: false,
        lookupData: {},
        kudaAccountLookup: {},
      };

    case DEBIT_CARD_PUSH:
      return {
        ...state,
        loading: false,
        success: action.success,
        loading: action.loading,
      };

    case ERROR:
      return {
        ...state,
        success: false,
        loading: false,
        error: action.payload,
      };

    case RESET_LOOK_UP:
      return {
        ...state,
        loading: false,
        lookupData: null,
      };

    default:
      return state;
  }
}
