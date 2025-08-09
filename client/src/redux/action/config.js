import { error, success } from "../../components/Alert";
import { generalErrMsg } from "../../helperFunctions";
import configService from "../../services/config-service";
import { CONFIGS_INQUIRY, LOADING_CONFIGS, ERROR } from "./types";

export const Configs = () => async (dispatch) => {
  // console.log("calling me config");
  dispatch({ type: LOADING_CONFIGS });
  try {
    const result = await configService.getConfigs();

    dispatch({
      type: CONFIGS_INQUIRY,
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
