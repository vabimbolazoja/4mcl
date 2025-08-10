import { error } from "../../components/Alert";
import { generalErrMsg } from "../../helperFunctions";
import iachService from "../../services/iach-service";
import { IACH, IACH_SESSION, LOADING_IACH, ERROR } from "./types";
import axios from "axios";
import config from "../../config";

export const getIAchSession = () => async (dispatch) => {
  dispatch({ type: LOADING_IACH });
  try {
    axios
      .get(`${config.baseUrl}/api/v1/profile/iAch/session-id`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        dispatch({
          type: IACH_SESSION,
          payload: res.data,
        });
      })
      .catch((err) => {
        if (err) {
          const message = err?.response?.data?.message;
          dispatch({
            type: ERROR,
            payload: message || generalErrMsg,
          });
          error("Error!", message || generalErrMsg);
        }
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

export const enableIAch =
  (sardineDeviceId, blackboxToken,iachSession) => async (dispatch) => {
    dispatch({ type: LOADING_IACH });
    try {
      const iachReq = {
        smsOptIn: true,
        deviceFingerPrint: blackboxToken,
        sessionIdentifier: sardineDeviceId,
        sessionKey:iachSession
      };
      const result = await iachService.enableIAch(iachReq);
      const iachResponse = {
        ...iachReq,
        iach_response: result,
      };
      dispatch({
        type: IACH,
        payload: iachResponse,
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
