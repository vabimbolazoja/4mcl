import {
  GET_STARTED,
  INITIATE_FORGOT_PASSWORD,
  RESET_PASSWORD,
  LOGIN,
  VERIFY_EMAIL,
  VERIFY_PHONE_AUTH,
  EMAIL_TO_BE_VERIFIED,
  PRE_VERIFY_EMAIL,
  REGISTER,
  CAPTHA_PROCESS,
  OTP_TO_BE_VERIFIED,
  LOADING_USER,
  DEVICE_OTP,
  OTP_VERIFY,
  ERROR,
  LOADING,
  PHONE_NUMBER,
  SHOPPING_ORIGIN,
  ADD_TO_CART,
  REMOVE_ITEM,
  SUB_CART,
  ADD_CART,
  EMPTY_CART,
} from "./types";
import axios from "axios";
import config from "../../config";
import jwt_decode from "jwt-decode";
import { fetchProfile } from "../action/user";
import { error, success } from "../../components/Alert/index";
import userService from "../../services/user-service";
import { Cookies } from "react-cookie";
import Cookie from "js-cookie";

export const emailToBeVerified = (email) => (dispatch) => {
  dispatch({
    type: EMAIL_TO_BE_VERIFIED,
    payload: email,
  });
};



export const otpToBeVerified = (otp) => (dispatch) => {
  dispatch({
    type: OTP_VERIFY,
    payload: otp,
  });
};

export const subQtyArr = (id) => (dispatch, getState) => {
  dispatch({
    type: SUB_CART,
    payload: id,
  });
  const {
    cart: { cartItems },
  } = getState();
  Cookie.set("cartItems", JSON.stringify(cartItems));
};

export const addQtyArr = (id) => (dispatch, getState) => {
  dispatch({
    type: ADD_CART,
    payload: id,
  });
  const {
    cart: { cartItems },
  } = getState();
  Cookie.set("cartItems", JSON.stringify(cartItems));
};

export const addCart = (id, qty, selctedMoq, prod) => (dispatch, getState) => {
  const {
    cart: { cartItems },
  } = getState();
  if (prod?._id) {
    dispatch({
      type: ADD_TO_CART,
      payload: {
        catalogueId: prod?._id,
        name: prod?.name,
        id: prod?._id,
        moq: prod?.moq,
        image: prod?.image,
        selctedMoq: selctedMoq,
        priceCurrency:prod?.priceCurrency,
        unitPrice: prod?.priceCurrency === 'USD' ? prod?.price : prod?.priceNaira,
        qty: Number(qty),
        subtotal:  prod?.priceCurrency === 'USD' ? prod?.price  * Number(qty) : prod?.priceNaira  * Number(qty),
      },
    });
  }
  sessionStorage.setItem('cartItems', JSON?.stringify(cartItems));
};

export const remove = (id) => (dispatch, getState) => {
  dispatch({
    type: REMOVE_ITEM,
    payload: id,
  });
  const {
    cart: { cartItems },
  } = getState();
  sessionStorage.setItem('cartItems', JSON?.stringify(cartItems));
};

export const emptyCart = () => (dispatch, getState) => {
  dispatch({
    type: EMPTY_CART,
    payload: {},
  });
  const {
    cart: { cartItems },
  } = getState();
  sessionStorage.setItem('cartItems', JSON?.stringify(cartItems));
};
