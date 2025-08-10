import userService from "../../services/user-service";
import {
  ERROR,
  LINKED_ACCOUNTS,
  LOADING_USER,
  MARK_TOUR_GUIDE,
  SHOW_CARD_TOKEN,
  CARD_RETRIEVAL,
  CARD_UPDATE,
  FREEZE_CARD,
  VCARD_BALANCE,
  CARD_DELETE,
  RESET_CARD_SET,
  SEND_PHONE_OTP,
  CARD_ACTIVATION,
  SAVEPIN,
  ON_ADD_BRIDGECARD,
  ACCEPT_KUDA_TERMS,
  USER_ACCOUNTS,
  UNLINK_ACCOUNT,
  RESET_CARD_OTPS,
  GET_BRIDGE_CARD,
  GET_CARD_OTPS,
  GET_PIN_TOKEN,
  UPDATECARD,
  UPDATE_PHONE,
  RESET_KYC,
  UPDATE_PROFILE_PICTURE,
  USER_PROFILE,
  VERIFY_PHONE_OTP,
  WALLET_BALANCE,
  KUDA_ACCOUNT_DETAILS,
  CONFIRM_KYC,
} from "./types";
import { error, success } from "../../components/Alert";
import { generalErrMsg } from "../../helperFunctions";

export const fetchProfile = () => async (dispatch) => {
  dispatch({ type: LOADING_USER });
  try {
    const result = await userService.fetchProfile();
    dispatch({
      type: USER_PROFILE,
      payload: result,
    });
    if (result.country === "UNITED_STATES") {
      dispatch(fetchLinkedAccounts());
    }
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
  }
};
export const resetOtps = () => async (dispatch) => {
  dispatch({ type: RESET_CARD_OTPS });
};

export const getCardOtp = (pin) => async (dispatch) => {
  const data = {
    transactionPin: pin,
  };
  dispatch({ type: LOADING_USER });
  try {
    const result = await userService.getCardOtps(data);
    dispatch({
      type: GET_CARD_OTPS,
      payload: result,
    });
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
  }
};
export const retrieveCard = (cardId) => async (dispatch) => {
  try {
    const result = await userService.retrieveCard(cardId);
    dispatch({
      type: CARD_RETRIEVAL,
      payload: result,
    });
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
  }
};

export const activateCard = (pin) => async (dispatch) => {
  const data = {
    cardPin: pin,
  };
  dispatch({ type: LOADING_USER });
  try {
    const result = await userService.onActivateCard(data);
    dispatch({
      type: CARD_ACTIVATION,
      payload: result,
    });
    dispatch(getBridgeCard());
    success("Success!", "Card PIN set and activated Successfully!");
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const getBridgeCard = () => async (dispatch) => {
  try {
    const result = await userService.getBridgeCard();
    dispatch({
      type: GET_BRIDGE_CARD,
      payload: result,
    });
  } catch (err) {
    dispatch({
      type: ERROR,
      payload: "",
    });
  }
};

export const savePin = (pin) => async (dispatch) => {
  dispatch({
    type: SAVEPIN,
    payload: pin,
  });
};

export const cardActionStatus = (id, status) => async (dispatch) => {
  dispatch({ type: LOADING_USER });
  try {
    const result = await userService.cardStatusAction(id, status);
    dispatch({
      type: FREEZE_CARD,
      payload: result,
    });
    success(
      "Success!",
      status === "freeze"
        ? "Card Freezed Successfully!"
        : "Card Unfreezed Successfully"
    );
    dispatch(fetchProfile());
    dispatch(getBridgeCard());
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};
export const acceptKudaterms = () => async (dispatch) => {
  dispatch({ type: LOADING_USER });
  try {
    const result = await userService.acceptKudaterms();
    dispatch({
      type: ACCEPT_KUDA_TERMS,
      payload: result,
    });
    dispatch(fetchProfile());
    success("Success!", "Terms accepted successfully");
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const onAddBridgeCard = () => async (dispatch) => {
  dispatch({ type: LOADING_USER });
  try {
    const result = await userService.addBBridgeCard();
    dispatch({
      type: ON_ADD_BRIDGECARD,
      payload: result,
    });
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};
export const updateCard = (details, id) => async (dispatch) => {
  dispatch({ type: LOADING_USER });
  try {
    const result = await userService.updateCard(details, id);
    dispatch({
      type: CARD_UPDATE,
      payload: result,
    });
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};
export const deleteCard = (cardId) => async (dispatch) => {
  try {
    const result = await userService.deleteCard(cardId);
    dispatch({
      type: CARD_DELETE,
      payload: result,
    });
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const resetKycLoad = () => async (dispatch) => {
  dispatch({ type: RESET_KYC });
};

// confirm KYC
export const confirmKYC = (data) => async (dispatch) => {
  try {
    const result = await userService.checkKYCStatus(data);
    dispatch({
      type: CONFIRM_KYC,
      payload: !Object.entries(result).length ? { status: 200 } : result,
    });
    // dispatch(fetchProfile());
    console.log(
      !Object.entries(result).length ? { status: 200 } : result,
      "kyc status"
    );
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
  }
};
export const getCardToken = (cardid) => async (dispatch) => {
  dispatch({ type: LOADING_USER });
  try {
    const result = await userService.showToken(cardid);
    dispatch({
      type: SHOW_CARD_TOKEN,
      payload: result,
    });
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
  }
};

export const getPinToken = (cardId) => async (dispatch) => {
  dispatch({ type: LOADING_USER });
  try {
    const result = await userService.getPinToken(cardId);
    dispatch({
      type: GET_PIN_TOKEN,
      payload: result,
    });
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
  }
};
export const userResets = () => async (dispatch) => {
  dispatch({ type: RESET_CARD_SET });
};

export const fetchAccounts = () => async (dispatch) => {
  dispatch({ type: LOADING_USER });
  try {
    const result = await userService.fetchBankAccounts();
    dispatch({
      type: USER_ACCOUNTS,
      payload: result,
    });
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    // error("Error!", message || generalErrMsg);
  }
};

export const fetchBalance = () => async (dispatch) => {
  dispatch({ type: LOADING_USER });
  try {
    const result = await userService.fetchAccounts();
    // console.log(result, "result balance");
    dispatch({
      type: WALLET_BALANCE,
      payload: result,
    });
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
  }
};

export const fetchBalanceCard = () => async (dispatch) => {
  dispatch({ type: LOADING_USER });
  try {
    const result = await userService.fetchCardBal();
    // console.log(result);
    dispatch({
      type: VCARD_BALANCE,
      payload: result,
    });
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
  }
};

export const fetchLinkedAccounts = (accId) => async (dispatch) => {
  dispatch({ type: LOADING_USER });
  try {
    const result = await userService.fetchLinkedAccounts(accId);
    dispatch({
      type: LINKED_ACCOUNTS,
      payload: result,
    });
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
  }
};

export const unlinkAccount = (data) => async (dispatch) => {
  dispatch({ type: LOADING_USER });
  try {
    const result = await userService.unlinkAccount(data);
    dispatch({
      type: UNLINK_ACCOUNT,
      payload: result,
    });
    success("Account unlinking successful");
    dispatch(fetchLinkedAccounts());
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const sendVerifyPhoneOtp = () => async (dispatch) => {
  try {
    const result = await userService.sendVerifyPhoneOtp();
    dispatch({
      type: SEND_PHONE_OTP,
      payload: result,
    });
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    // error("Error!", message || generalErrMsg);
  }
};

export const verifyPhoneOtp = (otp) => async (dispatch) => {
  dispatch({ type: LOADING_USER });
  try {
    const result = await userService.verifyPhoneOtp(otp);
    dispatch({
      type: VERIFY_PHONE_OTP,
      payload: result,
    });
    dispatch(fetchProfile());
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const updatePhoneNumber = (data) => async (dispatch) => {
  dispatch({ type: LOADING_USER });
  try {
    const result = await userService.updatePhoneNumber(data);
    dispatch({
      type: UPDATE_PHONE,
      payload: result,
    });
    dispatch(fetchProfile());
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const updateProfilePicture =
  (userCode, profilePicture) => async (dispatch) => {
    let formData = new FormData();
    formData.append("userCode", userCode.trim());
    formData.append("profilePicture", profilePicture);

    dispatch({ type: LOADING_USER });
    try {
      const result = await userService.updateProfilePicture(formData);
      dispatch({
        type: UPDATE_PROFILE_PICTURE,
        payload: result,
      });
      dispatch(fetchProfile());
    } catch (err) {
      const message = err?.response?.data?.message;
      dispatch({
        type: ERROR,
        payload: message || generalErrMsg,
      });
      error("Error!", message || generalErrMsg);
    }
  };

export const markTourGuide = () => async (dispatch) => {
  try {
    const result = await userService.markTourGuide();
    dispatch({
      type: MARK_TOUR_GUIDE,
      payload: result,
    });
    dispatch(fetchProfile());
  } catch (err) {}
};

// KUDA ENDPOINT

export const fetchKudaAccount = () => async (dispatch) => {
  try {
    const result = await userService.fetchKudaBankAccounts();
    dispatch({
      type: KUDA_ACCOUNT_DETAILS,
      payload: result,
    });
    // dispatch(fetchProfile());
  } catch (err) {}
};
