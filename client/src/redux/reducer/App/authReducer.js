import {
  EMAIL_TO_BE_VERIFIED,
  GET_STARTED,
  LOGIN,
  VERIFY_EMAIL,
  INITIATE_FORGOT_PASSWORD,
  REGISTER,
  RESET_PASSWORD,
  OTP_TO_BE_VERIFIED,
  CAPTHA_PROCESS,
  OTP_VERIFY,
  REFEREE_DETAILS,
  INITIATE_UNLOCK_ACCOUNT,
  VERIFY_PHONE_AUTH,
  PRE_VERIFY_EMAIL,
  SHOPPING_ORIGIN,
  PHONE_NUMBER,
} from "../../action/types";

export default function (
  state = {
    emailToVerify: "",
    getStartedEmail: "",
    accType: "",
    loading: false,
    phoneOtp: "",
    businessDone: false,
    phoneVerify: false,
    error: false,
    success: false,
    otp: "",
    auth:'no',
    country: "",
    popUpResetModal: false,
    popVerificationModal: false,
    capthaErr: false,
    emailToBeVerified:'',
    msg: "",
    refDetails: {},
    shoppingOrigin:null,
    preVerifySent: false,
    phoneNumber: "",
  },
  action
) {
  switch (action.type) {
    case REGISTER:
      return {
        ...state,
        loading: action.payload.loading,
        msg: action.payload.msg,
        emailToBeVerified:action.payload.emailToBeVerified,
        success: action.payload.success,
        error: action.payload.error,
      };

      case SHOPPING_ORIGIN:
        console.log(action.payload, 'this is the value origin')
      return {
        shoppingOrigin: action?.payload,
      };
   
    case OTP_VERIFY:
      return {
        ...state,
        otp: action.payload,
      };
    case PRE_VERIFY_EMAIL:
      return {
        ...state,
        preVerifySent: action.payload.success,
      };
    case OTP_TO_BE_VERIFIED:
      return {
        ...state,
        phoneOtp: action.payload,
        phoneVerify: action.payload.phoneVerify,
        success: action.payload.success,
        loading: action.payload.loading,
        error: action.payload.error,
      };
    case VERIFY_PHONE_AUTH:
      return {
        ...state,
        phoneNumber: action.payload.phone,
        loading: action.payload.loading,
        success: action.payload.success,
        phoneVerify: action.payload.phoneVerify,
        error: action.payload.error,
        phoneOtp: action.payload.phoneOtp,
        country: action.payload.country,
        accType: action.payload.accType,
      };
    case GET_STARTED:
      return {
        ...state,
        getStartedEmail: action.payload,
      };
    case LOGIN:
      console.log(action.payload)
      return {
        ...state,
        loading: action.payload.loading,
        businessDone: action.payload.businessDone,
        emailToVerify: action.payload.email,
        msg: action.payload.msg,
        success: action.payload.success,
        auth:action?.payload?.auth,
        error: action.payload.error,
        accType: action.payload.accType,
      };
    case VERIFY_EMAIL:
      return {
        ...state,
        loading: action.payload.loading,
        msg: action.payload.msg,
        success: action.payload.success,
        error: action.payload.error,
      };
    case INITIATE_FORGOT_PASSWORD:
      return {
        ...state,
        loading: action.payload.loading,
        msg: action.payload.msg,
        success: action.payload.success,
        error: action.payload.error,
      };

    case RESET_PASSWORD:
      return {
        ...state,
        loading: action.payload.loading,
        msg: action.payload.msg,
        popUpResetModal: action.payload.popUpResetModal,
        success: action.payload.success,
        error: action.payload.error,
      };
    case CAPTHA_PROCESS:
      return {
        ...state,
        loading: action.payload.loading,
        msg: action.payload.msg,
        capthaErr: action.payload.capthaErr,
        success: action.payload.success,
        error: action.payload.error,
      };
    case REFEREE_DETAILS:
      return {
        ...state,
        refDetails: action.payload,
      };

    case INITIATE_UNLOCK_ACCOUNT:
      return {
        ...state,
        unlockDetails: action.payload,
      };
    case PHONE_NUMBER:
      return {
        ...state,
        phoneNumber: action.payload,
      };
    default:
      return state;
  }
}
