import {
  DEVICE_OTP,
  ERROR,
  LINKED_ACCOUNTS,
  LOADING_USER,
  FREEZE_CARD,
  MARK_TOUR_GUIDE,
  BRIDGE_CARD_FUND,
  CARD_UPDATE,
  RESET_LINKING,
  SAVEPIN,
  VISA_CARD_PIN_SET,
  VCARD_BALANCE,
  ACCEPT_KUDA_TERMS,
  CARD_DELETE,
  SHOW_CARD_TOKEN,
  RESET_CARD_SET,
  USER_ACCOUNTS,
  CARD_RETRIEVAL,
  RESET_CARD_OTPS,
  CARD_ACTIVATION,
  SEND_PHONE_OTP,
  ON_ADD_BRIDGECARD,
  UNLINK_ACCOUNT,
  READ_USER_INFO,
  GET_PIN_TOKEN,
  GET_BRIDGE_CARD,
  UPDATE_PHONE,
  UPDATE_PROFILE_PICTURE,
  USER_PROFILE,
  VERIFY_PHONE_OTP,
  WALLET_BALANCE,
  KUDA_ACCOUNT_DETAILS,
  GET_CARD_OTPS,
  CONFIRM_KYC,
} from "../action/types";

const initState = {
  loadingUser: false,
  profile: {},
  walletBalance: {},
  cardStatus: {},
  userPin: "",
  linkedAccounts: [],
  otpSent: {},
  phoneOtpSent: {},
  otpVerified: {},
  phoneUpdate: {},
  accountLinked: {},
  mark: {},
  cardRetrieval: {},
  deletesuccess: false,
  accounts: {},
  userDetails: {},
  pinsuccess: false,
  cardOtps: {},
  userPinToken: {},
  cardUpdate: false,
  cardDelete: false,
  cardActivation: false,
  showCardToken: {},
  bridgeCardDetails: {},
  virtualCard: false,
  addBridgeCard: false,
  kudaAccount: {},
  kudaTerms: {},
  kycConfirmed: {},
};

export function userReducer(state = initState, action) {
  switch (action.type) {
    case LOADING_USER:
      return {
        ...state,
        loadingUser: true,
        virtualCard: false,
      };

    case RESET_CARD_OTPS:
      return {
        ...state,
        loadingUser: false,
        cardOtps: {},
      };
    case CONFIRM_KYC:
      return {
        ...state,
        // loadingUser: false,
        kycConfirmed: action.payload,
      };

    case CARD_ACTIVATION:
      return {
        ...state,
        loadingUser: false,
        virtualCard: false,
        cardActivation: true,
      };

    case SHOW_CARD_TOKEN:
      return {
        ...state,
        loadingUser: false,
        virtualCard: false,
        showCardToken: action.payload,
      };
    case ACCEPT_KUDA_TERMS:
      return {
        ...state,
        loadingUser: false,
        kudaTerms: action.payload,
      };
    case FREEZE_CARD:
      return {
        ...state,
        loadingUser: false,
        cardStatus: action.payload,
      };
    case CARD_RETRIEVAL:
      return {
        ...state,
        loadingUser: false,
        cardRetrieval: action.payload,
      };
    case VCARD_BALANCE:
      return {
        ...state,
        loadingUser: false,
      };
    case SAVEPIN:
      return {
        ...state,
        loadingUser: false,
        userPin: action.payload,
      };
    case ON_ADD_BRIDGECARD:
      return {
        ...state,
        loadingUser: false,
        virtualCard: false,
        addBridgeCard: true,
      };
    case CARD_DELETE:
      return {
        ...state,
        loadingUser: false,
        deletesuccess: true,
      };
    case CARD_UPDATE:
      return {
        ...state,
        loadingUser: false,
        cardUpdate: true,
      };
    case GET_BRIDGE_CARD:
      return {
        ...state,
        loadingUser: false,
        bridgeCardDetails: action.payload,
      };
    case RESET_CARD_SET:
      return {
        ...state,
        loadingUser: true,
        pinsuccess: false,
        deletesuccess: false,
        cardUpdate: false,
        addBridgeCard: false,
        cardDelete: false,
      };

    case USER_PROFILE:
      return {
        ...state,
        loadingUser: false,
        profile: action.payload,
      };
    case VISA_CARD_PIN_SET:
      return {
        ...state,
        loadingUser: false,
        pinsuccess: true,
      };

    case GET_PIN_TOKEN:
      return {
        ...state,
        loadingUser: false,
        userPinToken: action.payload,
      };

    case USER_ACCOUNTS:
      return {
        ...state,
        loadingUser: false,
        accounts: action.payload,
      };

    case WALLET_BALANCE:
      return {
        ...state,
        loadingUser: false,
        walletBalance: action.payload,
      };

    case LINKED_ACCOUNTS:
      return {
        ...state,
        loadingUser: false,
        linkedAccounts: action.payload.data,
      };
    case READ_USER_INFO:
      return {
        ...state,
        loadingUser: action.payload.loading,
        userDetails: action.payload.data,
      };

    case UNLINK_ACCOUNT:
      return {
        ...state,
        loadingUser: false,
        unlink: action.payload.data,
      };

    case DEVICE_OTP:
      return {
        ...state,
        loadingSend: false,
        otpSent: action.payload.data,
      };

    case SEND_PHONE_OTP:
      return {
        ...state,
        loadingUser: false,
        phoneOtpSent: action.payload,
      };

    case GET_CARD_OTPS:
      return {
        ...state,
        loadingUser: false,
        cardOtps: action.payload,
      };

    case VERIFY_PHONE_OTP:
      return {
        ...state,
        loadingUser: false,
        otpVerified: action.payload,
      };

    case UPDATE_PHONE:
      return {
        ...state,
        loadingUser: false,
        phoneUpdate: action.payload,
      };

    case UPDATE_PROFILE_PICTURE:
      return {
        ...state,
        loadingUser: false,
        pictureUpdated: action.payload,
      };
    case MARK_TOUR_GUIDE:
      return {
        ...state,
        mark: action.payload,
      };
    case ERROR:
      return {
        ...state,
        loadingUser: false,
        error: action.payload,
      };
    // KUDA BANK
    case KUDA_ACCOUNT_DETAILS:
      return {
        ...state,
        kudaAccount: action.payload,
      };

    default:
      return state;
  }
}
