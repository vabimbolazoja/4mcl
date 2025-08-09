import contactService from "../../services/contact-service";
import sendMoneyService from "../../services/send-money-service";
import {
  CREATE_CONTACT,
  ERROR,
  LOADING,
  RESET_STATUS,
  RESET_VGS,
  CREATE_DEBIT_CARD_CONTACT,
  ACH_TYPES,
  INVOKE_VGS,
  LOADING_USER,
  LOOKUP_ACCOUNT_KUDA,
  GET_KUDA_BANKS,
  DEBIT_CARD_PUSH,
  VISA_CARD_PIN_SET,
  FETCH_CONTACTS,
  LOADING_SEND_MONEY,
  INTRA_BANK_TRANSFER,
  RESET_LOOK_UP,
  LOOKUP_ACCOUNT,
  LOOKUP_ACCOUNT_USD,
  USD_INTRA_BANK_TRANSFER,
} from "./types";
import { generalErrMsg } from "../../helperFunctions";
import { error, success } from "../../components/Alert";
import { fetchContact } from "../action/contact";
import { fetchAccounts, fetchKudaAccount } from "../action/user";
import { getPlaidBankAccInfo } from "../action/plaid";
import { submitPaid } from "./plaid";
export const getAchTypes = () => async (dispatch) => {
  try {
    const result = await sendMoneyService.getAchTypes();
    dispatch({
      type: ACH_TYPES,
      payload: result,
    });
    console.log(result);
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const resetLookUp = () => async (dispatch) => {
  dispatch({
    type: RESET_STATUS,
  });
};

export const visaCardPinVgs = () => async (dispatch) => {
  dispatch({
    type: LOADING,
    payload: false,
  });
  dispatch({
    type: VISA_CARD_PIN_SET,
  });
};

export const loadVgs = () => async (dispatch) => {
  dispatch({
    type: LOADING,
    payload: true,
  });
};

export const resetVgs = () => async (dispatch) => {
  dispatch({
    type: RESET_VGS,
  });
};

export const resetStatus = () => async (dispatch) => {
  dispatch({
    type: RESET_STATUS,
  });
};

export const intrabankTransfer =
  (data, pin, createdContactId) => async (dispatch) => {
    console.log(createdContactId);
    dispatch({
      type: LOADING,
      payload: true,
    });
    const newData = {
      accountId: data.accountId,
      request: {
        contactId: data.contactId ? data?.contactId : createdContactId,
        amount: data.amount,
        description: data.description,
        type: "",
      },
      transferType: "INTRA_BANK",
      pin: data.pin ? data.pin : pin,
    };
    try {
      const result = await sendMoneyService.usdTransfer(newData);
      dispatch({
        type: INTRA_BANK_TRANSFER,
        payload: result,
        success: true,
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

export const getKudabanks = () => async (dispatch) => {
  try {
    const result = await sendMoneyService.getKudabanks();
    dispatch({
      type: GET_KUDA_BANKS,
      payload: result,
      success: true,
    });
    dispatch(fetchAccounts());
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
  }
};

export const achBankTransfer = (data, pin) => async (dispatch) => {
  console.log(data, pin);
  dispatch({
    type: LOADING,
    payload: true,
  });
  const newData = {
    accountId: data.accountId,
    request: {
      contactId: data.contactId,
      amount: data.amount,
      description: data.description,
      type: "",
    },
    transferType: "ACH",
    pin: pin ? pin : data.pin,
  };
  try {
    const result = await sendMoneyService.usdTransfer(newData);
    dispatch({
      type: INTRA_BANK_TRANSFER,
      payload: result,
      success: true,
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

export const performMoneyOutWallet = (data) => async (dispatch) => {
  dispatch({
    type: LOADING,
    payload: true,
  });
  try {
    const result = await sendMoneyService.performMoneySendWallet(data);
    dispatch({
      type: INTRA_BANK_TRANSFER,
      payload: result,
      success: true,
    });
    dispatch(fetchKudaAccount());
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

export const performKudaIntraTransfer = (data) => async (dispatch) => {
  dispatch({
    type: LOADING,
    payload: true,
  });
  try {
    const result = await sendMoneyService.performKudaIntraTransfer(data);
    dispatch({
      type: INTRA_BANK_TRANSFER,
      payload: result,
      success: true,
    });
    dispatch(fetchKudaAccount());
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

// USD send money
export const performUSDIntraTransfer = (data) => async (dispatch) => {
  dispatch({
    type: LOADING,
    payload: true,
  });
  try {
    const result = await sendMoneyService.performUSDIntraTransfer(data);
    dispatch({
      type: USD_INTRA_BANK_TRANSFER,
      payload: result,
      success: true,
    });
    // dispatch(fetchKudaAccount());
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

export const debitCardPush = (data, userInfo, pin, fee) => async (dispatch) => {
  console.log(data);
  dispatch({
    type: LOADING,
    payload: true,
  });
  const newData = {
    accountId: data?.accountId,
    contactId: data?.contactId,
    fee: fee,
    pin: pin,
    amount: data?.amount,
    description: "DEBIT CARD FUNDING",
  };
  try {
    const result = await sendMoneyService.debitCardPush(newData);
    if (result) {
      dispatch({
        type: LOADING,
        payload: false,
      });
      dispatch({
        type: DEBIT_CARD_PUSH,
        success: true,
        loading: false,
      });
      dispatch(fetchAccounts());
    }
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const debitCardPushVgs =
  (data, achData, pin, fee) => async (dispatch) => {
    dispatch({
      type: LOADING,
      payload: true,
    });
    const newData = {
      accountId: data?.accountId,
      contactId: data?.id,
      pin: pin,
      fee: fee,
      amount: achData?.amount,
      description: "DEBIT CARD FUNDING",
    };
    try {
      const result = await sendMoneyService.debitCardPush(newData);
      if (result) {
        dispatch({
          type: LOADING,
          payload: false,
        });
        dispatch({
          type: DEBIT_CARD_PUSH,
          success: true,
          loading: false,
        });
        dispatch(fetchAccounts());
      }
    } catch (err) {
      const message = err?.response?.data?.message;
      dispatch({
        type: ERROR,
        payload: message || generalErrMsg,
      });
      error("Error!", message || generalErrMsg);
    }
  };

export const achFundAccTransfer =
  (accountid, linkedAccount, amount, pin) => async (dispatch) => {
    console.log(pin);
    dispatch({
      type: LOADING,
      payload: true,
    });
    const newData = {
      amount: amount,
      description: "ACH funding",
      accountId: accountid,
      linkedAccountId: linkedAccount,
      pin: pin,
    };
    try {
      const result = await sendMoneyService.achRecieve(newData);
      dispatch({
        type: INTRA_BANK_TRANSFER,
        payload: result,
        success: true,
      });
      dispatch(fetchAccounts());
      success("Success!", "Funds sent successfully");
    } catch (err) {
      const message = err?.response?.data?.message;
      dispatch({
        type: ERROR,
        payload: message || generalErrMsg,
      });
      error("Error!", message || generalErrMsg);
    }
  };

export const sendWire = (data, type, pin, fee) => async (dispatch) => {
  dispatch({
    type: LOADING_SEND_MONEY,
    payload: true,
  });
  const newData = {
    accountId: data.accountId,
    request: {
      contactId: data.contactId,
      amount: data.amount,
      description: data.purpose,
      type: data?.transferType ? data?.transferType : type,
    },
    transferType: "WIRE",
    type,
    fee: fee ? fee : data?.fee,
    pin: pin ? pin : data?.pin,
  };

  try {
    const result = await sendMoneyService.usdTransfer(newData);
    dispatch({
      type: INTRA_BANK_TRANSFER,
      payload: result,
      success: true,
    });
    dispatch({
      type: LOADING_SEND_MONEY,
      payload: false,
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

export const wireTransferInt = (data) => async (dispatch) => {
  console.log(data, "here");
  const newData = {
    accountId: data.accountId,
    contactId: data.contactId,
    amount: data.amount,
    description: data.description,
    type: "international",
    recipientPostalCode: data.postal,
    beneficiaryBank: data.bankName,
    recipientCity: data.city,
    purpose: data.purpose,
    description: data.purpose,
    accountType: data.accType,
    recipientProfession: data.proffession,
    bankName: data.bankName,
    beneficiaryBankAddressDto: {
      country: data.bankCountry,
      city: data.bankCity,
      addressType: "wire",
      postalCode: data.bankPostal,
      state: data.bankState,
      line1: data.bankCity,
      line2: data.bankAddress,
    },
    accountNumber: data.accountNum,
    beneficiaryAddressDto: {
      country: data.country,
      city: data.city,
      addressType: "wire",
      postalCode: data.postal,
      state: data.state,
      line1: data.city,
      line2: data.address,
    },
    bankIdentifierCode: "string",
    recipientState: data.state,
    routingNumber: data.routingNum,
    recipientType: data.recType,
    recipientPhoneNumber: data.phone
      ? data.phone
      : sessionStorage.getItem("wirePhoneNumber"),
    recipientAddress: data.address,
    bankIdentifierType: "string",
    recipientName: data.name,
    recipientCountry: data.country,
    bankAccountToDebit: data.accountId,
    recipientEmail: data.email,
  };
  try {
    const result = await sendMoneyService.wireTransfer(newData);
    dispatch({
      type: INTRA_BANK_TRANSFER,
      payload: result,
    });
    dispatch({
      type: LOADING_SEND_MONEY,
      payload: false,
    });
    success("Success!", "Funds sent successfully");
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const performWireTransfer = (data, type, pin) => async (dispatch) => {
  dispatch({
    type: LOADING_SEND_MONEY,
    payload: true,
  });
  const newDataDomestic = {
    kladotCreateContact: {
      wire: {
        domestic: {
          routingNumber: data.routingNum,
          address: {
            line1: data.city,
            line2: data.address,
            city: data.city,
            state: data.state,
            country: "US",
            postalCode: data.postal,
          },
          accountType:
            data.accType === "Personal Checking"
              ? "personalChecking"
              : "businessChecking",
          bankName: data.bankName,
          accountNumber: data.accountNum,
        },
      },
      name: data.fullName,
      email: data.email,
      phone: data.phone,
    },
    transferType: "WIRE",
    accountId: data?.accountId,
  };
  const newDataInt = {
    accountId: data?.accountId,
    kladotCreateContact: {
      wire: {
        international: {
          correspondentBank: "",
          beneficiaryBank: data?.bankName,
          beneficiaryBankAddress: {
            line1: data.bankAddress,
            addressType: "wire",
            line2: data.bankAddress2,
            city: data.bankCity,
            state: data.bankState,
            country: data.bankCountry,
            postalCode: data.bankPostal,
          },
          beneficiaryAddress: {
            line1: data.address,
            line2: data.address2,
            city: data.city,
            addressType: "wire",
            state: data.state,
            country: data.country,
            postalCode: data.postal,
          },
          accountType: data.accType,
          bankIdentifierType: "Swift",
          bankIdentifierCode: data.bankIdentifierCode,
          accountNumber: data.accountNum,
        },
      },
      name: data.fullName,
      email: data.email,
      phone: data.phone,
    },
    transferType: "INTERNATIONAL_WIRE",
  };
  try {
    const result = await contactService.createContact(
      type === "domestic" ? newDataDomestic : newDataInt
    );
    dispatch({
      type: CREATE_CONTACT,
      payload: result,
    });
    if (result) {
      dispatch(
        sendWire({
          ...data,
          contactId: result.contactId,
          type,
          pin,
        })
      );
    }
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const performDebitCardPush =
  (data, profile, cardName) => async (dispatch) => {
    console.log(data);
    dispatch({
      type: LOADING,
      payload: true,
    });
    const newData = {
      name: profile.firstName + " " + profile.lastName,
      email: profile.email,
      phone: profile.phoneNumber,
    };
    try {
      const result = await contactService.createContactDebitCard(newData);
      dispatch({
        type: CREATE_DEBIT_CARD_CONTACT,
        payload: result,
      });

      if (result) {
        dispatch({
          type: LOADING,
          payload: false,
        });
        dispatch({
          type: INVOKE_VGS,
          payload: true,
        });
      }
    } catch (err) {
      const message = err?.response?.data?.message;
      dispatch({
        type: ERROR,
        payload: message || generalErrMsg,
      });
      error("Error!", message || generalErrMsg);
    }
  };

export const performIntraTransfer = (data) => async (dispatch) => {
  dispatch({
    type: LOADING,
    payload: true,
  });
  const newData = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    status: "active",
    channelType: "INTRABANK",
    intraBank: {
      accountNumber: data.accountNumber,
    },
  };
  try {
    const result = await contactService.createContact(newData);
    dispatch({
      type: CREATE_CONTACT,
      payload: result,
    });
    if (result) {
      dispatch(fetchContact());
      dispatch(
        intrabankTransfer({ ...data, contactId: result.contactId, type: "" })
      );
    }
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};
export const performAchTransfer = (data) => async (dispatch) => {
  dispatch({
    type: LOADING,
    payload: true,
  });
  const newData = {
    accountId: data.accountId,

    kladotCreateContact: {
      ach: {
        accountNumber: data.accountNumber,
        routingNumber: data.routingNumber,
        accountType: data.accType,
        bankName: data.bankName,
      },
      name: data.name,
      email: data.email,
      phone: data.phone,
    },
    transferType: "ACH",
  };
  try {
    const result = await contactService.createContact(newData);
    dispatch({
      type: CREATE_CONTACT,
      payload: result,
    });
    if (result) {
      dispatch(fetchContact());
      dispatch(
        achBankTransfer({ ...data, contactId: result.contactId, type: "" })
      );
    }
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const performAchFundTransfer =
  (accountDetails, data) => async (dispatch) => {
    dispatch({
      type: LOADING,
      payload: true,
    });
    const newData = {
      name: accountDetails.accountName,
      email: "bimmsnew@mailinator.com",
      phone: "+16509552577",
      status: "active",
      channelType: "ACH",
      wireType: "DOMESTIC",
      ach: {
        accountNumber: accountDetails.accountNumber,
        routingNumber: accountDetails.routingNumber,
        accountType: "personalChecking",
        bankName: data.selectedBankName,
      },
    };
    try {
      const result = await contactService.createContact(newData);
      dispatch({
        type: CREATE_CONTACT,
        payload: result,
      });
      if (result) {
        const StoreDatatoLink = {
          publicToken: data.publicToken,
          accountName: data.accountName,
          selectedAccountId: data.selectedAccountId,
          solidAccountId: data.solidAccountId,
          selectedBankName: data.selectedBankName,
          friendlyName: data.friendlyName,
          routingNum: accountDetails.routingNumber,
          accountType: data.accountType,
        };
        dispatch(submitPaid(StoreDatatoLink));
      }
    } catch (err) {
      const message = err?.response?.data?.message;
      dispatch({
        type: ERROR,
        payload: message || generalErrMsg,
      });
      error("Error!", message || generalErrMsg);
    }
  };

export const lookupAccount = (phone, accountId) => async (dispatch) => {
  dispatch({
    type: LOOKUP_ACCOUNT,
    payload: {},
  });
  dispatch({
    type: LOADING,
  });
  try {
    const result = await sendMoneyService.lookupAccount(phone, accountId);
    dispatch({
      type: LOOKUP_ACCOUNT,
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

export const lookupAccountKudaInter = (data) => async (dispatch) => {
  dispatch({
    type: LOADING,
    payload: {},
  });
  try {
    const result = await sendMoneyService.lookupAccountKudaInter(data);
    dispatch({
      type: LOOKUP_ACCOUNT_KUDA,
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

export const lookupAccountKudaIntra = (email) => async (dispatch) => {
  dispatch({
    type: LOADING,
    payload: {},
  });
  try {
    const result = await sendMoneyService.lookupAccountKuda(email);
    dispatch({
      type: LOOKUP_ACCOUNT_KUDA,
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

// look up USD intra bank
export const lookupAccountUSDIntra = (email) => async (dispatch) => {
  dispatch({
    type: LOADING,
    payload: {},
  });
  try {
    const result = await sendMoneyService.lookupAccountUSD(email);
    dispatch({
      type: LOOKUP_ACCOUNT_USD,
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
