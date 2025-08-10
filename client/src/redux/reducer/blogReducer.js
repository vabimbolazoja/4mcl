import { ERROR, LOADING_BLOG, BLOG } from "../action/types";

const initState = {
  loading: false,
  blog: {},
};

export function blogReducer(state = initState, action) {
  switch (action.type) {
    case LOADING_BLOG:
      return {
        ...state,
        loading: true,
      };

    case BLOG:
      return {
        ...state,
        loading: false,
        blog: action.payload,
        
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
