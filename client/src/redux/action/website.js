import { error, success } from "../../components/Alert";
import { generalErrMsg } from "../../helperFunctions";
import websiteService from "../../services/website-service";
import { ASK_INQUIRY, LOADING_WEBSITE, ERROR, SWITCH_APP,RESET_APP } from "./types";

export const askInquiry = (data) => async (dispatch) => {
  dispatch({ type: LOADING_WEBSITE });
  try {
    const inquiry = {
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      question: data.question,
    };
    const result = await websiteService.askInquiryMsg(inquiry);
    const inquiryDetails = {
      ...inquiry,
      infos: result,
    };
    dispatch({
      type: ASK_INQUIRY,
      payload: inquiryDetails,
    });
    success("Success!", "Message Sent");
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const onAppSwitch = (appType) => async (dispatch) => {
  dispatch({ type: SWITCH_APP, payload: appType});
};

export const resetApps = (data) => async (dispatch) => {
  dispatch({ type: LOADING_WEBSITE});
  dispatch({ type: RESET_APP});
};
