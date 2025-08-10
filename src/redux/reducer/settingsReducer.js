import {
  ACTIVATE_INSTANT_SETTLEMENT,
  ALL_NOTIFICATIONS,
  APPLY_NOTIFICATION_PREFERENCE,
  EDIT_FRIENDLY_NAME,
  ERROR,
  GET_NOTIFICATION_PREFERENCES,
  GET_NOTIFICATION_PREFERENCE_CHANNELS,
  GET_REFERRALS,
  INITIATE_PASSWORD_RESET,
  INITIATE_PIN_SETUP,
  JOIN_WAITLIST,
  LOADING_SETTINGS,
  LOADING_SETTLEMENT,
  MIGRATE_TO_PAYEE,
  PASSWORD_RESET,
  SET_PIN,
  SUBMIT_MICRO_DEBIT,
  SWITCH_TO_PERSONAL,
} from "../action/types";

const initState = {
  loading: false,
  loadingSettlement: false,
  send: {},
  allNotifications: {},
  settlement: {},
  submitDebit: {},
  migrate: {},
  referrals: {},
  notificationPreference: {},
  notificationPreferenceChannels: {},
  applyNotificationPreference: {},
  editName: {},
  joinList: {},
};

export function settingsReducer(state = initState, action) {
  switch (action.type) {
    case LOADING_SETTINGS:
      return {
        ...state,
        loading: true,
      };

    case LOADING_SETTLEMENT:
      return {
        ...state,
        loadingSettlement: true,
      };

    case INITIATE_PIN_SETUP:
      return {
        ...state,
        loading: false,
        send: action.payload,
      };

    case SET_PIN:
      return {
        ...state,
        loading: false,
        pinStatus: action.payload,
      };

    case INITIATE_PASSWORD_RESET:
      return {
        ...state,
        loading: false,
        initiate: action.payload,
      };

    case PASSWORD_RESET:
      return {
        ...state,
        loading: false,
        passwordStatus: action.payload,
      };
    case ALL_NOTIFICATIONS:
      return {
        ...state,
        loading: false,
        allNotifications: action.payload,
      };
    case ACTIVATE_INSTANT_SETTLEMENT:
      return {
        ...state,
        loadingSettlement: false,
        settlement: action.payload,
      };

    case SUBMIT_MICRO_DEBIT:
      return {
        ...state,
        loadingSettlement: false,
        submitDebit: action.payload,
      };
    case MIGRATE_TO_PAYEE:
      return {
        ...state,
        loading: false,
        migrate: action.payload,
      };
    case SWITCH_TO_PERSONAL:
      return {
        ...state,
        loading: false,
        switchPersonal: action.payload,
      };

    case GET_REFERRALS:
      return {
        ...state,
        loading: false,
        referrals: action.payload,
      };

    case GET_NOTIFICATION_PREFERENCES:
      return {
        ...state,
        loading: false,
        notificationPreference: action.payload,
      };

    case GET_NOTIFICATION_PREFERENCE_CHANNELS:
      return {
        ...state,
        loading: false,
        notificationPreferenceChannels: action.payload,
      };

    case APPLY_NOTIFICATION_PREFERENCE:
      return {
        ...state,
        loading: false,
        applyPreference: action.payload,
      };

    case EDIT_FRIENDLY_NAME:
      return {
        ...state,
        loading: false,
        editName: action.payload,
      };

    case JOIN_WAITLIST:
      return {
        ...state,
        loading: false,
        joinList: action.payload,
      };

    case ERROR:
      return {
        ...state,
        loading: false,
        loadingSettlement: false,
        error: action.payload,
      };

    default:
      return state;
  }
}
