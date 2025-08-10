import {
  ERROR,
  LOADING_WEBSITE,
  ASK_INQUIRY,
  RESET_APP,
  SWITCH_APP,
} from "../action/types";

const initState = {
  loading: false,
  inquiry: {},
  app: 0,
};

export function websiteReducer(state = initState, action) {
  switch (action.type) {
    case LOADING_WEBSITE:
      return {
        ...state,
        loading: true,
      };

    case ASK_INQUIRY:
      return {
        ...state,
        loading: false,
        inquiry: action.payload,
      };

    case ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case SWITCH_APP:
      console.log(action.payload)
      return {
        ...state,
        loading: false,
        app: action.payload,
      };

    case RESET_APP:
      return {
        ...state,
        loading: false,
        app: 0,
      };

    default:
      return state;
  }
}
