import { ERROR, LOADING_CONFIGS, CONFIGS_INQUIRY } from "../action/types";
const initState = {
  loading: false,
  configData: {},
};

export function configReducer(state = initState, action) {
  switch (action.type) {
    case LOADING_CONFIGS:
      return {
        ...state,
        loading: true,
      };

    case CONFIGS_INQUIRY:
      return {
        ...state,
        loading: false,
        configData: action.payload,
        
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
