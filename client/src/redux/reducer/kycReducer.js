import {
  ERROR,
  KYC_VERIFICATION,
  LOADING,
  VERIFICATION_DETAILS,
  RESET_KYC,
  VERIFICATION_DETAILS_KYC,
  ACCOUNT_MIGRATION,
  CONFIRM_KYC,
  KYC_STATES,
  RESET_CONFIRM_KYC
} from "../action/types";

const initState = {
  loadingKyc: false,
  fullKyc: false,
  data: {},
  migratedUser: false,
  confirmKyc:false,
  resetConfirmKyc:false,
  stateLists: {},
};

export function kycReducer(state = initState, action) {
  switch (action.type) {
    case LOADING:
      return {
        ...state,
        loadingKyc: true,
        fullKyc: false,
        migratedUser: false,
        kycConfirmed: false,
      };
    case KYC_VERIFICATION:
      console.log(action.payload);
      return {
        ...state,
        loadingKyc: false,
        data: action.payload,
        fullKyc: action.payload.fullKyc,
        migratedUser: false,
      };
    case VERIFICATION_DETAILS:
      return {
        ...state,
        loadingKyc: false,
        details: action.payload,
        fullKyc: false,
        migratedUser: false,
      };
    case VERIFICATION_DETAILS_KYC:
      return {
        ...state,
        loadingKyc: false,
        details: action.payload,
        fullKyc: false,
        migratedUser: false,
      };
    case KYC_STATES:
      return {
        ...state,
        loadingKyc: false,
        stateLists: action.payload,
      };
    case CONFIRM_KYC:
      return {
        ...state,
        loadingKyc: false,
        confirmKyc:true
      };
      case RESET_CONFIRM_KYC:
        return {
          ...state,
          loadingKyc: false,
          confirmKyc:false
        };
    case ERROR:
      return {
        ...state,
        loadingKyc: false,
        error: action.payload,
        fullKyc: false,
        migratedUser: false,
      };
    case ACCOUNT_MIGRATION:
      return {
        ...state,
        loadingKyc: false,
        error: action.payload,
        migratedUser: true,
      };
    case RESET_KYC:
      return {
        ...state,
        data: {},
        loadingKyc: false,
      };
    default:
      return state;
  }
}
