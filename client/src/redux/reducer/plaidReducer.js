import { ERROR, LOADING, ADD_PLAID_ACC, RESET_LINKING } from "../action/types";

const initState = {
  loading: false,
  list: {},
  success: false,
  accountLinked: false,
};

export function plaidReducer(state = initState, action) {
  switch (action.type) {
    case LOADING:
      return {
        ...state,
        loading: action.payload,
        success: false,
        accountLinked: false,
      };

    case RESET_LINKING:
      return {
        ...state,
        accountLinked: false,
      };

    case ADD_PLAID_ACC:
      return {
        ...state,
        loading: false,
        list: action.payload,
        accountLinked: true,
        success: true,
      };

    case ERROR:
      return {
        ...state,
        loading: false,
        success: false,
        accountLinked: false,
        error: action.payload,
      };

    default:
      return state;
  }
}
