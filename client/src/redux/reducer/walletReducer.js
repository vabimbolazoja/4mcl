import {
  ADD_BENEFICIARY,
  ERROR,
  FEE_CHECKER,
  FEE_CHECKER_FLAT,
  FEE_CONFIG,
  BRIDGE_CARD_FUND,
  FETCH_ACC_NAME,
  FETCH_BENEFICIARIES,
  FUND_WITH_FLW,
  FUND_WITH_SILA,
  GET_CONFIGS,
  VCARD_BALANCE,
  INSTANT_SETTLEMENT_FEE,
  LOADING_BENEFICIARIES,
  NEW_WALLET,
  LOADING_ENQUIRY,
  LOADING_WALLET,
  LOADING_WALLET2,
  REMOVE_BENEFICIARY,
  USD_PAYOUT,
  US_BENEFICIARIES,
  WITHDRAW_DOLLAR,
  WITHDRAW_DOM,
  WITHDRAW_NAIRA,
  FETCH_4TRADER_BENEFICIARIES,
  RESET_FEE_CONFIG,
} from "../action/types";

const initState = {
  loading: false,
  loading2: false,
  loadingEnquiry: false,
  loadingBen: false,
  allow: false,
  feeConfig: {},
  feeCheck: {},
  fund: {},
  token: {},
  instantFee: {},
  success: false,
  usBen: {},
  walletCreated: {},
  usPay: {},
  virtualCard: {},
  cardBalance: {},
  traderxBeneficiaries: [],
};

export function walletReducer(state = initState, action) {
  switch (action.type) {
    case LOADING_WALLET:
      return {
        ...state,
        loading: true,
      };
    case FEE_CHECKER_FLAT:
      return {
        ...state,
        loading: false,
        feeFlat: action.payload,
      };
    case LOADING_WALLET2:
      return {
        ...state,
        loading2: true,
      };
    case VCARD_BALANCE:
      return {
        ...state,
        cardBalance: action.payload,
      };
    case VCARD_BALANCE:
      return {
        ...state,
        cardBalance: action.payload,
      };
    case RESET_FEE_CONFIG:
      return {
        ...state,
        feeConfig: {},
        feeCheck: {},
      };

    case LOADING_BENEFICIARIES:
      return {
        ...state,
        loadingBen: true,
      };
    case BRIDGE_CARD_FUND:
      return {
        ...state,
        loading: false,
        loading2: false,
        virtualCard: action.payload,
      };
    case NEW_WALLET:
      return {
        ...state,
        loadingBen: false,
        loading: false,
        success: true,
        walletCreated: action.payload,
      };

    case LOADING_ENQUIRY:
      return {
        ...state,
        loadingEnquiry: true,
        success: false,
      };

    case FEE_CONFIG:
      return {
        ...state,
        loading: false,
        feeConfig: action.payload,
        allow: action.allow,
        success: false,
      };

    case FEE_CHECKER:
      return {
        ...state,
        loading: false,
        feeCheck: action.payload,
        success: false,
      };

    case FUND_WITH_FLW:
      return {
        ...state,
        loading: false,
        fund: action.payload,
        flwAmount: action.flwAmount,
        success: false,
      };

    case FUND_WITH_SILA:
      return {
        ...state,
        loading: false,
        fund: action.payload,
        success: false,
        silaAmt: action.silaAmt,
      };

    case FETCH_ACC_NAME:
      return {
        ...state,
        loadingEnquiry: false,
        accName: action.payload,
        success: false,
      };

    case WITHDRAW_NAIRA:
      return {
        ...state,
        loading: false,
        success: false,
        withdrawStatus: action.payload,
      };
    case WITHDRAW_DOLLAR:
      return {
        ...state,
        loading: false,
        withdrawDStatus: action.payload,
      };
    case WITHDRAW_DOM:
      return {
        ...state,
        loading2: false,
        domWithdrawal: action.payload,
      };
    case GET_CONFIGS:
      return {
        ...state,
        loading: false,
        domConfig: action.payload,
      };
    case FETCH_BENEFICIARIES:
      return {
        ...state,
        loadingBen: false,
        beneficiaries: action.payload,
      };
    case FETCH_4TRADER_BENEFICIARIES:
      return {
        ...state,
        loadingBen: false,
        traderxBeneficiaries: action.payload.data,
      };
    case ADD_BENEFICIARY:
      return {
        ...state,
        loadingBen: false,
        addBeneficiary: action.payload,
      };
    case REMOVE_BENEFICIARY:
      return {
        ...state,
        loadingBen: false,
        removeBeneficiary: action.payload,
      };

    case INSTANT_SETTLEMENT_FEE:
      return {
        ...state,
        loading: false,
        instantFee: action.payload,
      };

    case US_BENEFICIARIES:
      return {
        ...state,
        loading: false,
        usBen: action.payload,
      };

    case USD_PAYOUT:
      return {
        ...state,
        loading: false,
        usPay: action.payload,
      };
    case ERROR:
      return {
        ...state,
        loading: false,
        loading2: false,
        loadingEnquiry: false,
        loadingBen: false,
        error: action.payload,
      };

    default:
      return state;
  }
}
