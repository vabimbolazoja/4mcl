import {
  ADD_BENEFICIARY,
  ERROR,
  FEE_CHECKER,
  FEE_CONFIG,
  FETCH_ACC_NAME,
  FEE_CHECKER_FLAT,
  FETCH_BENEFICIARIES,
  NEW_WALLET,
  FUND_WITH_FLW,
  FUND_WITH_SILA,
  GET_CONFIGS,
  BRIDGE_CARD_FUND,
  INSTANT_SETTLEMENT_FEE,
  LOADING_BENEFICIARIES,
  LOADING_ENQUIRY,
  LOADING_WALLET,
  RESET_FEE_CONFIG,
  LOADING_WALLET2,
  REMOVE_BENEFICIARY,
  USD_PAYOUT,
  US_BENEFICIARIES,
  WITHDRAW_DOLLAR,
  WITHDRAW_DOM,
  WITHDRAW_NAIRA,
  FETCH_4TRADER_BENEFICIARIES,
} from "./types";
import { error, success } from "../../components/Alert";
import {
  formatDollars,
  formatNaira,
  generalErrMsg,
} from "../../helperFunctions";
import walletService from "../../services/wallet-service";
import {
  fetchBalance,
  fetchProfile,
  fetchAccounts,
  fetchBalanceCard,
} from "./user";

export const fetchFeeConfig = (fundDetails) => async (dispatch) => {
  dispatch({ type: LOADING_WALLET });
  try {
    const result = await walletService.fetchFeeConfig();
    if (result.status === 200) {
      if (
        fundDetails.currency === "USD" &&
        Number(fundDetails.amount) < result.usdMinimumLimit
      ) {
        dispatch({
          type: FEE_CONFIG,
          payload: result,
          allow: false,
        });
        error(
          "Error!",
          `The minimum deposit amount for USD wallet is ${formatDollars.format(
            result?.usdMinimumLimit
          )}`
        );
      } else if (
        fundDetails.currency === "NGN" &&
        Number(fundDetails.amount) < result.ngnMinimumLimit
      ) {
        dispatch({
          type: FEE_CONFIG,
          payload: result,
          allow: false,
        });
        error(
          "Error!",
          `The minimum deposit amount for NGN wallet is ${formatNaira.format(
            result?.ngnMinimumLimit
          )}`
        );
      } else {
        dispatch({
          type: FEE_CONFIG,
          payload: result,
          allow: true,
        });
      }
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

export const getCardDepositFee = () => async (dispatch) => {
  dispatch({ type: LOADING_WALLET });
  try {
    const result = await walletService.feeCheckerCard();
    dispatch({
      type: FEE_CHECKER,
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


export const resetFeeConfig = () => async (dispatch) => {
  dispatch({ type: RESET_FEE_CONFIG });
 
};



export const getCardFee = () => async (dispatch) => {
  try {
    const result = await walletService.feeCheckerFlat();
    dispatch({
      type: FEE_CHECKER_FLAT,
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

export const feeChecker = (details) => async (dispatch) => {
  dispatch({ type: LOADING_WALLET });
  try {
    const result = await walletService.feeChecker(details);
    dispatch({
      type: FEE_CHECKER,
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

export const handlePullFromAccountDeposit = (amt) => async (dispatch) => {
  const data = {
    amount: amt,
  };
  dispatch({ type: LOADING_WALLET });
  try {
    const result = await walletService.pullFromAccDepositNGN(data);
    dispatch({
      type: FUND_WITH_FLW,
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

export const handlePushMoneyToAccount = (amt) => async (dispatch) => {
  const data = {
    amount: amt,
  };
  dispatch({ type: LOADING_WALLET });
  try {
    const result = await walletService.pushToAccountWithdraw(data);
    dispatch({
      type: FUND_WITH_FLW,
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

export const fundWithBridgeNGN = (details) => async (dispatch) => {
  dispatch({ type: LOADING_WALLET });
  try {
    const result = await walletService.fundWithBridgeNGN(details);
    dispatch({
      type: BRIDGE_CARD_FUND,
      payload: result,
    });
    dispatch(fetchBalanceCard());
    dispatch(fetchAccounts());
    success("Success!", "Virtual Card funded successfully!");
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const fundWithBridge = (details) => async (dispatch) => {
  dispatch({ type: LOADING_WALLET });
  try {
    const result = await walletService.fundWithBridge(details);
    dispatch({
      type: BRIDGE_CARD_FUND,
      payload: result,
    });
    dispatch(fetchBalanceCard());
    dispatch(fetchAccounts());
    success(
      "Success!",
      details?.transactionType === "CREDIT"
        ? "Virtual Card funded successfully!"
        : "Fund Trasferred successfully to USD wallet"
    );
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const withdrawFeeChecker = (details, type) => async (dispatch) => {
  dispatch({ type: LOADING_WALLET });
  try {
    const result = await walletService.withdrawFee(details, type);
    dispatch({
      type: FEE_CHECKER,
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

export const activateWallet = (currency) => async (dispatch) => {
  try {
    const result = await walletService.activateWallet(currency);
    dispatch(fetchAccounts());
    dispatch(fetchBalance());
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
  }
};

export const fundWithFlw = (details) => async (dispatch) => {
  dispatch({ type: LOADING_WALLET });
  try {
    const result = await walletService.fundWithFlw(details);
    dispatch({
      type: FUND_WITH_FLW,
      payload: result,
      flwAmount: details.amount,
    });
    dispatch({
      type: FEE_CONFIG,
      allow: false,
    });
    dispatch(fetchProfile());
    dispatch(fetchBalance());
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const fundWithSila = (details) => async (dispatch) => {
  dispatch({ type: LOADING_WALLET });
  try {
    const result = await walletService.fundWithSila(details);
    dispatch({
      type: FUND_WITH_SILA,
      payload: result,
      silaAmt: details.amount,
    });
    dispatch({
      type: FEE_CONFIG,
      allow: false,
    });
    dispatch(fetchProfile());
    dispatch(fetchBalance());
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const fetchAccName = (details) => async (dispatch) => {
  dispatch({ type: LOADING_ENQUIRY });
  try {
    const result = await walletService.fetchAccName(details);
    dispatch({
      type: FETCH_ACC_NAME,
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

export const withdrawNaira = (details) => async (dispatch) => {
  dispatch({ type: LOADING_WALLET });
  try {
    const result = await walletService.withdrawNaira(details);
    dispatch({
      type: WITHDRAW_NAIRA,
      payload: result,
    });
    dispatch({
      type: FEE_CONFIG,
      allow: false,
    });

    dispatch(fetchProfile());
    dispatch(fetchBalance());
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });

    error("Error!", message || generalErrMsg);
  }
};

export const withdrawDollar = (details) => async (dispatch) => {
  dispatch({ type: LOADING_WALLET });
  try {
    const result = await walletService.withdrawDollar(details);
    dispatch({
      type: WITHDRAW_DOLLAR,
      payload: result,
    });
    dispatch({
      type: FEE_CONFIG,
      allow: false,
    });
    dispatch(fetchProfile());
    dispatch(fetchBalance());
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const getConfigs = () => async (dispatch) => {
  try {
    const result = await walletService.getConfigs();
    dispatch({
      type: GET_CONFIGS,
      payload: result,
    });
  } catch (err) {}
};

export const withdrawDom = (details) => async (dispatch) => {
  dispatch({ type: LOADING_WALLET2 });
  try {
    const result = await walletService.withdrawDom(details);
    dispatch({
      type: WITHDRAW_DOM,
      payload: result,
    });
    dispatch({
      type: FEE_CONFIG,
      allow: false,
    });
    dispatch(fetchProfile());
    dispatch(fetchBalance());
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const fetchBeneficiaries = () => async (dispatch) => {
  try {
    const result = await walletService.fetchBeneficiaries();
    dispatch({
      type: FETCH_BENEFICIARIES,
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

// 4Traderx beneficiaries
export const fetch4TraderBeneficiaries = () => async (dispatch) => {
  try {
    const result = await walletService.get4TraderXBeneficiaries();
    // console.log(result, "///all bene");
    dispatch({
      type: FETCH_4TRADER_BENEFICIARIES,
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

export const addBeneficiary = (data) => async (dispatch) => {
  dispatch({ type: LOADING_BENEFICIARIES });
  try {
    const result = await walletService.addBeneficiary(data);
    dispatch({
      type: ADD_BENEFICIARY,
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

export const removeBeneficiary = () => async (dispatch) => {
  dispatch({ type: LOADING_BENEFICIARIES });
  try {
    const result = await walletService.removeBeneficiary();
    dispatch({
      type: REMOVE_BENEFICIARY,
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

export const instantSettlementFee = (details) => async (dispatch) => {
  dispatch({ type: LOADING_WALLET });
  try {
    const result = await walletService.instantSettlementFee(details);
    dispatch({
      type: INSTANT_SETTLEMENT_FEE,
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

export const usBeneficiaries = () => async (dispatch) => {
  dispatch({ type: LOADING_WALLET });
  try {
    const result = await walletService.usBeneficiaries();
    dispatch({
      type: US_BENEFICIARIES,
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

export const usdPayout = (data) => async (dispatch) => {
  dispatch({ type: LOADING_WALLET });
  try {
    const result = await walletService.usdPayout(data);
    dispatch({
      type: USD_PAYOUT,
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

export const usdPayoutFee = (details) => async (dispatch) => {
  dispatch({ type: LOADING_WALLET });
  try {
    const result = await walletService.usdPayoutFee(details);
    dispatch({
      type: FEE_CHECKER,
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

export const cashAppConfig = (fundDetails) => async (dispatch) => {
  dispatch({ type: LOADING_WALLET });
  try {
    const result = await walletService.cashAppConfig(fundDetails);
    dispatch({
      type: FEE_CONFIG,
      payload: result,
      allow: true,
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

export const StripeConfig = (data) => async (dispatch) => {
  dispatch({ type: LOADING_WALLET });
  try {
    const result = await walletService.stripeConfig(data);
    dispatch({
      type: FEE_CONFIG,
      payload: result,
      allow: true,
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

export const addNewWallet = (currency) => async (dispatch) => {
  dispatch({ type: LOADING_WALLET });
  try {
    const result = await walletService.addNewWallet(currency);
    dispatch({
      type: NEW_WALLET,
      payload: result,
    });
    dispatch(activateWallet(currency));
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
