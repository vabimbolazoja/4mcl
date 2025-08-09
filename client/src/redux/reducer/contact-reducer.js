import {
  ERROR,
  LOOKUP_ACCOUNT,
  INTRA_BANK_TRANSFER,
  LOADING_SEND_MONEY,
  REMOVE_CONTACT,
  FETCH_CONTACTS,
  FETCH_CONTACT_INFO,
  LOADING_CONTACTS,
  CREATE_CONTACT,
  CREATE_DEBIT_CARD_CONTACT,
} from "../action/types";

const initState = {
  loading: false,
  fetchContactData: [],
  fetchContactInfo:{},
  debitCardToken: {},
  createContactData: {},
  error: {},
  createContactDataDebit: {},
};

export function contactReducer(state = initState, action) {
  switch (action.type) {
    case LOADING_CONTACTS:
      return {
        ...state,
        loading: true,
        success: false,
      };

    case FETCH_CONTACTS:
      return {
        ...state,
        loading: false,
        fetchContactData: action.payload.data,
        success: action.payload.success,
      };

    case FETCH_CONTACT_INFO:
      return {
        ...state,
        loading: false,
        fetchContactInfo: action.payload.data,
        success: action.payload.success,
      };

    case REMOVE_CONTACT:
      return {
        ...state,
        loading: action.payload.loading,
        fetchContactData: action.payload.data,
        success: action.payload.success,
      };

    case CREATE_CONTACT:
      return {
        ...state,
        loading: false,
        createContactData: action.payload,
      };

    case CREATE_DEBIT_CARD_CONTACT:
      return {
        ...state,
        loading: false,
        debitCardToken: action.payload,
      };
    case ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
}
