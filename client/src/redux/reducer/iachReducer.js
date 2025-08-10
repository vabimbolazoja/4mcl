import { ERROR, LOADING_IACH, IACH, IACH_SESSION } from "../action/types";

const initState = {
  loading: false,
  iachSession: {},
  iach:{}
};

export function iachReducer(state = initState, action) {
  switch (action.type) {
    case LOADING_IACH:
      return {
        ...state,
        loading: true,
      };

    case IACH_SESSION:
      return {
        ...state,
        loading: false,
        iachSession: action.payload,
        
      };
    case IACH:
      return {
        ...state,
        loading: false,
        iach:true
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
