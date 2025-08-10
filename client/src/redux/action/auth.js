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
  SHOPPING_ORIGIN,
  OTP_VERIFY,
  ERROR,
  LOADING,
  PHONE_NUMBER,
} from "./types";
import axios from "axios";
import config from "../../config";
import jwt_decode from "jwt-decode";
import { useToast } from "@/hooks/use-toast";
import { fetchProfile } from "../action/user";
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

export const confirmPhoneOtp = (otp, accType, phone, country) => (dispatch) => {
  dispatch({
    type: VERIFY_PHONE_AUTH,
    payload: {
      loading: true,
      phoneOtp: otp,
      phoneVerify: false,
      accType: accType,
      phoneOtp: otp,
      country: country,
      phone: phone,
    },
  });
  axios
    .post(`${config.baseUrl}/auth/v2/verify-phone`, {
      phoneNumber: phone,
      verificationCode: otp,
      country: country,
    })
    .then((res) => {
      if (res.status === 200) {
        dispatch({
          type: VERIFY_PHONE_AUTH,
          payload: {
            success: false,
            phoneVerify: true,
            error: false,
            accType: accType,
            phone: phone,
            loading: false,
            phoneOtp: otp,
            country: country,
          },
        });
        success("Success!", "Phone Number Confirmed Successfully!");
      }
    })
    .catch((err) => {
      if (err.response !== undefined) {
        dispatch({
          type: VERIFY_PHONE_AUTH,
          payload: {
            success: false,
            phoneVerify: false,
            error: true,
            loading: false,
            phone: "",
          },
        });
        error("Error!", err.response.data.message);
      } else {
        error("Error!", "Connection Error!");
      }
    });
};

export const shopOrigin = (place) => (dispatch) => {
  console.log('got to action', place)
  dispatch({
    type: SHOPPING_ORIGIN,
    payload:place
  });
};

export const cancelEmail = () => (dispatch) => {
  dispatch({
    type: GET_STARTED,
    payload: null,
  });
};

export const onLogin = (credentials) => (dispatch) => {
  sessionStorage.setItem("emailToResend", credentials?.username.trim());
  dispatch({
    type: LOGIN,
    payload: {
      success: false,
      error: false,
      loading: true,
      msg: "",
    },
  });
  axios
    .post(`${config.baseUrl}login`, {
      password: credentials.password,
      email: credentials.username ? credentials.username.trim("+") : "",
    })
    .then((response) => {
      console.log(response);
      if (response.status === 200) {
        dispatch({
          type: LOGIN,
          payload: {
            success: true,
            error: false,
            loading: false,
            msg: "Login Successful!",
          },
        });
        var token = response.data.user?.token;
        sessionStorage.setItem('token', token)
        Cookie.set('token-xtx', token)
        Cookie.set('_idd', response.data.user.id)
        Cookie.remove('cartItems')
        var userResp = response.data.user;
        if (userResp) {
          if (userResp?.status) {
            dispatch({
              type: LOGIN,
              payload: {
                success: true,
                error: false,
                auth:'yes',
                loading: false,
                msg: "Login Successful!",
              },
            });
            success("Success", "Login Successful!");
          } else {
            error("Error", "Email not verified yet");
            resendEmail();
            window.location.href = "/verify-email";
          }
        }
      } else {
        dispatch({
          type: LOGIN,
          payload: {
            success: false,
            error: true,
            loading: false,
            msg: "Connection Error!",
          },
        });
        error("Error!", "Invalid Email Address");
      }
    })
    .catch((err) => {
      dispatch({
        type: LOGIN,
        payload: {
          success: false,
          error: true,
          loading: false,
        },
      });
      error("Error!", err?.response?.data?.message);
    });
};

export const onboardBusiness = (data) => (dispatch) => {
  dispatch({
    type: LOGIN,
    payload: {
      success: false,
      error: false,
      loading: true,
      businessDone: false,
      msg: "",
    },
  });
  axios
    .post(`${config.baseUrl}/v1/profile/onboard-business`, data)
    .then((response) => {
      if (response.status === 201) {
        dispatch({
          type: LOGIN,
          payload: {
            success: true,
            error: false,
            loading: false,
            businessDone: true,
            msg: "",
          },
        });
        dispatch(cancelEmail());
        success("Success", "Business Onboarded Successfully");
        // setTimeout(() => {
        //   window.location.href = "/login";
        // }, 3000);
      }
    })
    .catch((err) => {
      if (err.response !== undefined) {
        dispatch({
          type: REGISTER,
          payload: {
            success: false,
            error: true,
            loading: false,
            msg: err.response.data.message,
          },
        });
        error("Error!", err.response.data.message);
      } else {
        dispatch({
          type: REGISTER,
          payload: {
            success: false,
            error: true,
            loading: false,
          },
        });
        error("Error!", "Connection Error");
      }
    });
};

export const registerUser = (credentials) => (dispatch) => {
  sessionStorage.setItem("emailToResend", credentials?.email.trim());
  dispatch({
    type: LOGIN,
    payload: {
      success: false,
      businessDone: false,
      error: false,
      email: credentials?.email,
      loading: true,
      msg: "",
      accType: credentials.accountType,
    },
  });
  axios
    .post(`${config.baseUrl}register`, {
      email: credentials.email?.trim(),
      password: credentials.password,
      fname: credentials?.firstName?.trim(),
      lname: credentials?.lastName?.trim(),
      phone: credentials?.phone,
    })
    .then((response) => {
      if (response.status === 201) {
        dispatch({
          type: LOGIN,
          payload: {
            success: true,
            error: false,
            loading: false,
            msg: "",
          },
        });
        success("Success", `Registration Successful,. A confirmation link has been sent to your registered email address -${credentials?.email}, Clikc the activation link to activate your account`);
      }
    })
    .catch((err) => {
      if (err.response !== undefined) {
        dispatch({
          type: REGISTER,
          payload: {
            success: false,
            error: true,
            loading: false,
            msg: err.response.data.message,
          },
        });
        error("Error!", err.response.data.message);
      } else {
        dispatch({
          type: REGISTER,
          payload: {
            success: false,
            error: true,
            loading: false,
          },
        });
        error("Error!", "Connection Error");
      }
    });
};

export const registerCompany = (credentials) => (dispatch) => {
  dispatch({
    type: LOGIN,
    payload: {
      success: false,
      error: false,
      loading: true,
      msg: "",
    },
  });
  let formData = new FormData();

  formData.append("emailAddress", credentials.emailAddress);
  formData.append("username", credentials.username);
  formData.append("password", credentials.password);
  formData.append("firstName", credentials.firstName);
  formData.append("lastName", credentials.lastName);
  formData.append("userHandle", credentials.userHandle);
  formData.append("accountType", credentials.accountType);
  formData.append("country", credentials.country);
  formData.append("phoneNumber", credentials.phoneNumber);
  formData.append("deviceIdentifier", credentials.deviceIdentifier);
  formData.append("channel", credentials.channel);
  formData.append("name", credentials.name);
  formData.append("identificationNumber", credentials.identificationNumber);
  formData.append("role", credentials.role);
  formData.append("identificationType", credentials.identificationType);
  formData.append("businessDocument", credentials.businessDocument);
  formData.append("referralCode", credentials.referralCode);

  axios
    .post(`${config.payrollUrl}/auth/company/sign-up`, formData)
    .then((response) => {
      if (response.status === 201) {
        dispatch({
          type: LOGIN,
          payload: {
            success: true,
            error: false,
            loading: false,
            msg: "",
          },
        });
        dispatch(cancelEmail());
        dispatch(emailToBeVerified(credentials.emailAddress));
        success("Success", "Registration Successful");
        setTimeout(() => {
          window.location.href = "/verify-phone";
        }, 2500);
      }
    })
    .catch((err) => {
      if (err.response !== undefined) {
        dispatch({
          type: REGISTER,
          payload: {
            success: false,
            error: true,
            loading: false,
            msg: err.response.data.message,
          },
        });
        error("Error!", err.response.data.message);
      } else {
        dispatch({
          type: REGISTER,
          payload: {
            success: false,
            error: true,
            loading: false,
          },
        });
        error("Error!", "Connection Error");
      }
    });
};
export const preVerifyEmail = (email) => (dispatch) => {
  axios
    .post(
      `${config.baseUrl}/auth/re-initiate-email-verification/${email}
    `,
      {
        email: email,
      }
    )
    .then((res) => {
      if (res.status === 200) {
        dispatch({
          type: PRE_VERIFY_EMAIL,
          payload: {
            success: true,
            error: false,
            loading: false,
          },
        });
      }
    })
    .catch((err) => {
      if (err.response !== undefined) {
        dispatch({
          type: ERROR,
          payload: {
            success: false,
            error: true,
            msg: err.response.data.message,
          },
        });
        error(
          "Error!",
          err.response.data.message
            ? err.response.data.message
            : "Connection Error"
        );
      } else {
        error("Error!", "Connection Error!");
      }
    });
};
export const emailVerification = (token) => (dispatch) => {
  dispatch({
    type: VERIFY_EMAIL,
    payload: {
      success: false,
      error: false,
      loading: true,
    },
  });
  axios
    .post(`${config.baseUrl}verify-email`, {
      id: token,
    })
    .then((res) => {
      if (res.status === 200) {
        dispatch({
          type: VERIFY_EMAIL,
          payload: {
            success: true,
            error: false,
            loading: false,
          },
        });
        success("Success!", res.data.message);
      }
    })
    .catch((err) => {
      if (err.response !== undefined) {
        dispatch({
          type: VERIFY_EMAIL,
          payload: {
            success: false,
            error: true,
            loading: false,
          },
        });
        error("Error!", err.response.data.message);
      }
    });
};

export const verifyPhone =
  (phone, accType, country, alreadyVerifiedPhone) => (dispatch) => {
    dispatch({
      type: VERIFY_PHONE_AUTH,
      payload: {
        success: false,
        error: false,
        loading: true,
        accType: accType,
        phone: phone?.replace("_", ""),
        country: country,
      },
    });
    axios
      .post(`${config.baseUrl}/auth/v2/pre-sign-up`, {
        accountType: accType,
        phoneNumber: phone?.replace("_", ""),
        country: country,
      })
      .then((res) => {
        if (res.status === 200) {
          console.log(accType);
          dispatch({
            type: VERIFY_PHONE_AUTH,
            payload: {
              success: true,
              error: false,
              loading: false,
              phone: phone,
              accType: accType,
              country: country,
            },
          });
          success(
            "Success!",
            "An OTP has been successfully sent to your phone number"
          );
        }
      })
      .catch((err) => {
        if (err.response !== undefined) {
          dispatch({
            type: VERIFY_PHONE_AUTH,
            payload: {
              success: false,
              error: true,
              loading: false,
              accType: accType,
            },
          });

          if (
            err.response.data.message ==
            `Phone number ${phone} has already been verified`
          ) {
            // console.log(
            //   err.response.data.message ==
            //     `Phone number ${phone} has already been verified`
            // );
            error("Error!", err.response.data.message);

            dispatch({
              type: PHONE_NUMBER,
              payload: phone,
            });
            alreadyVerifiedPhone();
            return;
          }
          error("Error!", err.response.data.message);
        } else {
          error("Error!", "Connection Error!");
        }
      });
  };

export const initiateForgotPassword = (email) => (dispatch) => {
  sessionStorage.setItem("emailForForgotPassword", email);
  dispatch({
    type: INITIATE_FORGOT_PASSWORD,
    payload: {
      success: false,
      error: false,
      loading: true,
      msg: "",
    },
  });
  axios
    .post(`${config.baseUrl}forgotPassword/${email}`, {})
    .then((response) => {
      if (response.status === 200) {
        dispatch({
          type: INITIATE_FORGOT_PASSWORD,
          payload: {
            success: true,
            error: false,
            loading: false,
          },
        });
        success("Success", `A reset link has been sent to your ${email}`);
        window.location.href = "/password-reset-mail";
      }
    })
    .catch((err) => {
      dispatch({
        type: INITIATE_FORGOT_PASSWORD,
        payload: {
          success: false,
          error: true,
          loading: false,
          msg: "Connection Error!",
        },
      });
      error("Error!", err?.response?.data?.message);
    });
};

export const resetPassword = (token, password) => (dispatch) => {
  dispatch({
    type: RESET_PASSWORD,
    payload: {
      success: false,
      error: false,
      loading: true,
      popUpResetModal: false,
      msg: "",
    },
  });
  axios
    .post(`${config.baseUrl}resetPassword`, {
      password: password,
      id: token,
    })
    .then((response) => {
      if (response.status === 200) {
        dispatch({
          type: RESET_PASSWORD,
          payload: {
            success: true,
            error: false,
            popUpResetModal: true,
            loading: false,
          },
        });
        success("Success!", "Your Password has been reset Successfully!");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      }
    })
    .catch((err) => {
      dispatch({
        type: RESET_PASSWORD,
        payload: {
          success: false,
          error: true,
          popUpResetModal: false,
          loading: false,
          msg: "Connection Error",
        },
      });
      error("Error!", err?.response?.data?.message);
    });
};

export const resendForgtoPasswordMail = (email) => (dispatch) => {
  dispatch({
    type: INITIATE_FORGOT_PASSWORD,
    payload: {
      success: false,
      error: false,
      loading: true,
      msg: "",
    },
  });
  axios
    .post(`${config.baseUrl}forgotPassword/${email}`, {})
    .then((response) => {
      if (response.status === 200) {
        dispatch({
          type: INITIATE_FORGOT_PASSWORD,
          payload: {
            success: true,
            error: false,
            loading: false,
          },
        });
        success("Success", `A reset link has been sent to your ${email}`);
      }
    })
    .catch((err) => {
      dispatch({
        type: INITIATE_FORGOT_PASSWORD,
        payload: {
          success: false,
          error: true,
          loading: false,
          msg: "Connection Error!",
        },
      });
      error("Error!", err?.response?.data?.message);
    });
};

export const resendEmail = () => (dispatch) => {
  dispatch({
    type: LOGIN,
    payload: {
      success: false,
      error: false,
      loading: true,
      capthaErr: false,
      msg: "",
    },
  });
  axios
    .post(`${config.baseUrl}resendEmail`, {
      email: sessionStorage.getItem("emailToResend"),
    })
    .then((response) => {
      if (response.status === 200) {
        success("Success", response?.data?.message);
        dispatch({
          type: LOGIN,
          payload: {
            success: false,
            error: false,
            loading: false,
            capthaErr: false,
            msg: "",
          },
        });
      }
    })
    .catch((err) => {
      dispatch({
        type: LOGIN,
        payload: {
          success: false,
          error: false,
          loading: false,
          capthaErr: false,
          msg: "",
        },
      });
      error("Error!", err?.response?.data?.message);
    });
};

export const verifyCapthaFunc = (token, userCreds, type) => (dispatch) => {
  dispatch({
    type: CAPTHA_PROCESS,
    payload: {
      success: false,
      error: false,
      loading: false,
      capthaErr: false,
      msg: "",
    },
  });
  axios
    .post(`${config.baseUrl}verifyCaptha`, {
      token: token,
    })
    .then((response) => {
      if (response.status === 200) {
        console.log(response.status, type);
        if (type === "login") {
          dispatch(onLogin(userCreds));
        } else {
          dispatch(registerUser(userCreds));
        }
      } else {
        // window.location.reload(false)
        dispatch({
          type: CAPTHA_PROCESS,
          payload: {
            success: false,
            error: false,
            capthaErr: true,
            loading: false,
          },
        });
        error("Error!", "Captha could not be verified, Try Again!");
      }
    })
    .catch((err) => {
      dispatch({
        type: CAPTHA_PROCESS,
        payload: {
          success: false,
          error: true,
          capthaErr: false,
          loading: false,
        },
      });
      error("Error!", err?.response?.data?.message);
    });
};

export const sendDeviceOtp = (email) => async (dispatch) => {
  dispatch({ type: LOADING_USER });

  try {
    const result = await userService.sendDeviceOtp(email);
    dispatch({
      type: DEVICE_OTP,
      payload: result,
    });
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message,
    });
  }
};

// export const initiateUnlockAccount = (email) => async (dispatch) => {
//   dispatch({ type: LOADING_USER });
//   try {
//     const result = await userService.initiateUnlockAccount(email);
//     dispatch({
//       type: INITIATE_UNLOCK_ACCOUNT,
//       payload: result,
//     });
//   } catch (err) {
//     const message = err?.response?.data?.message;
//     dispatch({
//       type: ERROR,
//       payload: message,
//     });
//   }
// };
