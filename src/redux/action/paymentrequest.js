import moment from "moment";
import { toast } from "react-toastify";
import { error } from "../../components/Alert";
import { generalErrMsg } from "../../helperFunctions";
import paymentRequestService from "../../services/paymentrequest-service";
import {
  PAYMENT_REQUEST_LIST,
  LOADING,
  ERROR,
  PAYMENT_DETAILS,
  SAVED_PAYMENT_REQUEST,
  LOADING_PAYMENT_REQUEST,
  
} from "./types";

export const paymentRequestList = () => async (dispatch) => {
  // dispatch({ type: LOADING, });
  try {
    const result = await paymentRequestService.fetchPaymentRequestList();
    dispatch({
      type: PAYMENT_REQUEST_LIST,
      payload: result?.data,
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

export const savePaymentRequest = (data) => async (dispatch) => {
  try {
    let formData = new FormData();
    formData.append("name", data?.name);
    formData.append("email", data?.email);
    formData.append("amount", data?.amount);
    formData.append("currency", data?.currency);
    formData.append("dueDate", moment(data?.dueDate).unix());
    formData.append("notes", data?.notes);
    formData.append("companyName", data?.companyName);
    // File attachment

    const result = await paymentRequestService.postPaymentRequest(formData);

    dispatch({
      type: SAVED_PAYMENT_REQUEST,
      payload: result,
    });
    toast.success("Payment request created successfully.");
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

// export const updatePaymentRequest =
//   (invoiceReference, status) => async (dispatch) => {
//     try {
//       dispatch({ type: LOADING_PAYMENT_REQUEST, payload: true });
//       const result = await paymentRequestService.updatePaymentRequestService(
//         invoiceReference,
//         status
//       );

//       console.log(result, "updating");
//       dispatch(paymentRequestList());
//       dispatch({ type: LOADING_PAYMENT_REQUEST, payload: false });
//     } catch (err) {
//       const message = err?.response?.data?.message;
//       dispatch({
//         type: ERROR,
//         payload: message || generalErrMsg,
//       });
//       error("Error!", message || generalErrMsg);
//     }
//   };

export const updatePaymentRequest =
  (invoiceReference, status) => async (dispatch) => {
    dispatch({ type: LOADING_PAYMENT_REQUEST, payload: true });

    try {
      const result = await paymentRequestService.updatePaymentRequestService(
        invoiceReference,
        status
      );
      console.log(result, "updated");

      dispatch(paymentRequestList());
      dispatch({ type: LOADING_PAYMENT_REQUEST, payload: false });
    } catch (err) {
      const message = err?.response?.data?.message;
      dispatch({
        type: ERROR,
        payload: message || generalErrMsg,
      });
      error("Error!", message || generalErrMsg);
    }
  };

export const updatePaymentRequestDetails = (data) => async (dispatch) => {
  try {
    dispatch({
      type: PAYMENT_DETAILS,
      payload: data,
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
