import {success, error } from "../../components/Alert";
import { generalErrMsg } from "../../helperFunctions";
import plaidService from "../../services/plaid-service";
import {performAchFundTransfer} from "../action/send-money"
import {
  ERROR,
  LOADING,
  PLAID_ACC_DETAILS,
  RESET_LINKING,
  ADD_PLAID_ACC,
} from "./types";
import {  fetchAccounts
} from "./user"

export const submitPaid = (data) => async (dispatch) => {
  dispatch({ type: LOADING });
  try {
    const result = await plaidService.submitPlaidAcc(data);
    dispatch({
      type: ADD_PLAID_ACC,
      payload: result,
    });
    dispatch(fetchAccounts());

  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const resetAccLinking = () => async (dispatch) => {
  dispatch({ type: RESET_LINKING });
 
};

export const getPlaidBankAccInfo = (plaidAcc) => async (dispatch) => {
    try {
      const result = await plaidService.plaidAccDetails({
        publicToken: plaidAcc.publicToken,
        accounts: [plaidAcc.selectedAccountId],
      });
      console.log(result);
      var accountName =result?.accounts[0].name; 
      var accountNumber = result?.numbers?.ach[0].account;
      var routingNumber  = result?.numbers?.ach[0].routing;
      const accountDetails = {
        accountName,accountNumber,routingNumber
      }
      dispatch(performAchFundTransfer(accountDetails, plaidAcc))
    } catch (err) {
      const message = err?.response?.data?.message;
      dispatch({
        type: ERROR,
        payload: message || generalErrMsg,
      });
      error("Error!", message || generalErrMsg);
    }
  };


