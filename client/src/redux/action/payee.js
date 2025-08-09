import { error, success } from "../../components/Alert";
import { generalErrMsg } from "../../helperFunctions";
import payeeService from "../../services/payee-service";
import {
  ACTIVATE_PLAN,
  COMPANIES,
  COMPANY_STATISTICS,
  CREATE_PLANS,
  CREATE_STAFF_SCHEDULE,
  DELETE_EMPLOYEE,
  DELETE_PLAN,
  ERROR,
  FETCH_ALL_STAFF,
  FETCH_COMPANY_INVITES,
  FETCH_STAFF_INVITES,
  FETCH_STAFF_SCHEDULE,
  GET_JOIN_REQUEST,
  GET_PLANS,
  INSTANT_PAYMENT,
  INVITE_EMPLOYEE,
  JOIN_COMPANY,
  LOADING_EMPLOYEE,
  PAYMENT_TRANSACTIONS,
  REMOVE_STAFF_SCHEDULE,
  SUSPEND_PLAN,
  TRANSACTION_VOLUME_FOUR,
  TRANSACTION_VOLUME_ONE,
  TRANSACTION_VOLUME_THREE,
  TRANSACTION_VOLUME_TWO,
  TREAT_INVITE,
  TREAT_JOIN_REQUEST,
  UPDATE_PLAN,
  UPDATE_STAFF_SCHEDULE,
} from "./types";

export const inviteEmployee = (data) => async (dispatch) => {
  dispatch({ type: LOADING_EMPLOYEE });

  try {
    const result = await payeeService.inviteEmployee(data);
    dispatch({
      type: INVITE_EMPLOYEE,
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

export const fetchStaffInvites = () => async (dispatch) => {
  dispatch({ type: LOADING_EMPLOYEE });

  try {
    const result = await payeeService.fetchStaffInvites();
    dispatch({
      type: FETCH_STAFF_INVITES,
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

export const fetchCompanyInvites = (query) => async (dispatch) => {
  dispatch({ type: LOADING_EMPLOYEE });

  try {
    const result = await payeeService.fetchCompanyInvites(query);
    dispatch({
      type: FETCH_COMPANY_INVITES,
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

export const treatInvite = (data) => async (dispatch) => {
  dispatch({ type: LOADING_EMPLOYEE });

  try {
    const result = await payeeService.treatInvite(data);
    dispatch({
      type: TREAT_INVITE,
      payload: result,
    });
    success("Great!", "Request successful" || generalErrMsg);
    dispatch(fetchStaffInvites());
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const joinCompany = (data) => async (dispatch) => {
  dispatch({ type: LOADING_EMPLOYEE });

  try {
    const result = await payeeService.joinCompany(data);
    dispatch({
      type: JOIN_COMPANY,
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

export const treatJoinRequest = (data) => async (dispatch) => {
  dispatch({ type: LOADING_EMPLOYEE });

  try {
    const result = await payeeService.treatJoinRequest(data);
    dispatch({
      type: TREAT_JOIN_REQUEST,
      payload: result,
    });
    dispatch(fetchJoinRequest());
    dispatch(fetchAllStaff());
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const fetchCompanies = (data) => async (dispatch) => {
  try {
    const result = await payeeService.fetchCompanies(data);
    dispatch({
      type: COMPANIES,
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

export const fetchJoinRequest = (data) => async (dispatch) => {
  try {
    const result = await payeeService.fetchJoinRequest(data);
    dispatch({
      type: GET_JOIN_REQUEST,
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

export const fetchAllStaff = (queryString) => async (dispatch) => {
  try {
    const result = await payeeService.fetchAllStaff(queryString);
    dispatch({
      type: FETCH_ALL_STAFF,
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

export const instantPayment = (data) => async (dispatch) => {
  dispatch({ type: LOADING_EMPLOYEE });

  try {
    const result = await payeeService.instantPayment(data);
    dispatch({
      type: INSTANT_PAYMENT,
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

export const fetchPaymentTransactions = () => async (dispatch) => {
  dispatch({ type: LOADING_EMPLOYEE });
  try {
    const result = await payeeService.fetchPaymentTransactions();
    dispatch({
      type: PAYMENT_TRANSACTIONS,
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

export const createPlan = (data) => async (dispatch) => {
  dispatch({ type: LOADING_EMPLOYEE });

  try {
    const result = await payeeService.createPlan(data);
    dispatch({
      type: CREATE_PLANS,
      payload: result,
    });
    dispatch(getAllPlans());
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const updatePlan = (code, data) => async (dispatch) => {
  dispatch({ type: LOADING_EMPLOYEE });

  try {
    const result = await payeeService.updatePlan(code, data);
    dispatch({
      type: UPDATE_PLAN,
      payload: result,
    });
    dispatch(getAllPlans());
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const getAllPlans = (query) => async (dispatch) => {
  dispatch({ type: LOADING_EMPLOYEE });

  try {
    const result = await payeeService.getAllPlans(query);
    dispatch({
      type: GET_PLANS,
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

export const activatePaymentPlan = (code, nextPayDate) => async (dispatch) => {
  dispatch({ type: LOADING_EMPLOYEE });

  try {
    const result = await payeeService.activatePaymentPlan(code, nextPayDate);
    dispatch({
      type: ACTIVATE_PLAN,
      payload: result,
    });
    dispatch(getAllPlans());
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const suspendPaymentPlan = (code) => async (dispatch) => {
  dispatch({ type: LOADING_EMPLOYEE });

  try {
    const result = await payeeService.suspendPaymentPlan(code);
    dispatch({
      type: SUSPEND_PLAN,
      payload: result,
    });
    dispatch(getAllPlans());
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const deletePaymentPlan = (code) => async (dispatch) => {
  dispatch({ type: LOADING_EMPLOYEE });

  try {
    const result = await payeeService.deletePaymentPlan(code);
    dispatch({
      type: DELETE_PLAN,
      payload: result,
    });
    dispatch(getAllPlans());
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const fetchStaffSchedule = (paymentPlanCode) => async (dispatch) => {
  dispatch({ type: LOADING_EMPLOYEE });

  try {
    const result = await payeeService.fetchStaffSchedule(paymentPlanCode);
    dispatch({
      type: FETCH_STAFF_SCHEDULE,
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

export const createStaffSchedule = (data) => async (dispatch) => {
  dispatch({ type: LOADING_EMPLOYEE });

  try {
    const result = await payeeService.createStaffSchedule(data);
    dispatch({
      type: CREATE_STAFF_SCHEDULE,
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

export const updateStaffSchedule = (id, data) => async (dispatch) => {
  dispatch({ type: LOADING_EMPLOYEE });

  try {
    const result = await payeeService.updateStaffSchedule(id, data);
    dispatch({
      type: UPDATE_STAFF_SCHEDULE,
      payload: result,
    });
    dispatch(fetchStaffSchedule(data?.paymentPlanCode));
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const removeStaffSchedule = (id, code) => async (dispatch) => {
  dispatch({ type: LOADING_EMPLOYEE });

  try {
    const result = await payeeService.removeStaffSchedule(id);
    dispatch({
      type: REMOVE_STAFF_SCHEDULE,
      payload: result,
    });
    dispatch(fetchStaffSchedule(code));
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const fetchCompanyStatistics =
  (startDate, endDate) => async (dispatch) => {
    dispatch({ type: LOADING_EMPLOYEE });

    try {
      const result = await payeeService.fetchCompanyStatistics(
        startDate,
        endDate
      );
      dispatch({
        type: COMPANY_STATISTICS,
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

export const transactionVolume = () => async (dispatch) => {
  dispatch({ type: LOADING_EMPLOYEE });

  try {
    const result1 = await payeeService.transactionVolume1({
      lowerBound: 0,
      upperBound: 100000,
      currency: "NGN",
    });
    const result2 = await payeeService.transactionVolume2({
      lowerBound: 100001,
      upperBound: 200000,
      currency: "NGN",
    });
    const result3 = await payeeService.transactionVolume3({
      lowerBound: 200001,
      upperBound: 300000,
      currency: "NGN",
    });
    const result4 = await payeeService.transactionVolume4({
      lowerBound: 300001,
      upperBound: 10000000,
      currency: "NGN",
    });

    dispatch({
      type: TRANSACTION_VOLUME_ONE,
      payload: result1,
    });
    dispatch({
      type: TRANSACTION_VOLUME_TWO,
      payload: result2,
    });
    dispatch({
      type: TRANSACTION_VOLUME_THREE,
      payload: result3,
    });
    dispatch({
      type: TRANSACTION_VOLUME_FOUR,
      payload: result4,
    });
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
  }
};

export const deleteEmployee = (data) => async (dispatch) => {
  dispatch({ type: LOADING_EMPLOYEE });

  try {
    const result = await payeeService.deleteEmployee(data);
    dispatch({
      type: DELETE_EMPLOYEE,
      payload: result,
    });
    dispatch(fetchAllStaff());
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};
