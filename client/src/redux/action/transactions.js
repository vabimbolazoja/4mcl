import { error } from "../../components/Alert";
import { generalErrMsg } from "../../helperFunctions";
import transactionService from "../../services/transaction-service";
import {
  ERROR,
  LOADING_TRANSACTION,
  TRANSACTION_LIST,
  TRANSACTION_LIST_CARD,
  TRANSACTION_LIST_ACCOUNT,
  CHART_DATA,
  KUDANGNCHART_DATA,
  KLADOT_CHART,
} from "./types";

export const fetchTransactions = (type, query) => async (dispatch) => {
  dispatch({ type: LOADING_TRANSACTION });

  try {
    const result = await transactionService.fetchTransactions(type, query);
    dispatch({
      type: TRANSACTION_LIST,
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

export const fetchCardTransactions = (type, query) => async (dispatch) => {
  dispatch({ type: LOADING_TRANSACTION });

  try {
    const result = await transactionService.fetchCardTransactions(query);
    dispatch({
      type: TRANSACTION_LIST_CARD,
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

export const fetchAccountTransactions =
  (accId, offset, limit, startdate, enddate) => async (dispatch) => {
    try {
      const result = await transactionService.fetchTransactionsAccount(
        accId,
        offset,
        limit,
        startdate,
        enddate
      );
      dispatch({
        type: TRANSACTION_LIST_ACCOUNT,
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

// US Kuda transactions
export const fetchChartAccountTransactions =
  (accId, query) => async (dispatch) => {
    try {
      const result = await transactionService.fetchChartTransaction(
        accId,
        query
      );
      // console.log(result, "from services");
      dispatch({
        type: CHART_DATA,
        payload: result?.response,
      });
      dispatch({ type: LOADING_TRANSACTION, payload: false });
    } catch (err) {
      const message = err?.response?.data?.message;
      dispatch({
        type: ERROR,
        payload: message || generalErrMsg,
      });
    }
  };

// NGN kuda transactions
// export const fetchChartAccountTransactions =
export const fetchNGNKudaChartAccountTransactions =
  (startDate, endDate) => async (dispatch) => {
    dispatch({ type: LOADING_TRANSACTION, payload: true });
    try {
      const result = await transactionService.fetchNGNKudaChartTransaction(
        startDate,
        endDate
      );

      // console.log(result, "from services");
      dispatch({
        type: KUDANGNCHART_DATA,
        payload: result?.response,
      });
      dispatch({ type: LOADING_TRANSACTION, payload: false });
    } catch (err) {
      const message = err?.response?.data?.message;
      dispatch({
        type: ERROR,
        payload: message || generalErrMsg,
      });
    }
  };

// kladot US transactions
export const fetchUSKladotChartAccountTransactions =
  (accId, limit, offset) => async (dispatch) => {
    dispatch({ type: LOADING_TRANSACTION, payload: true });
    try {
      const result = await transactionService.fetchUSKladotChartTransaction(
        accId,
        limit,
        offset
      );
      // console.log(result, "kladot response");
      dispatch({
        type: KLADOT_CHART,
        payload: result?.response,
      });
      // dispatch({ type: LOADING_TRANSACTION, payload: false });
    } catch (err) {
      // console.log("Got here now, '//////'");
      const message = err?.response?.data?.message;
      dispatch({
        type: ERROR,
        payload: message || generalErrMsg,
      });
    }
  };
