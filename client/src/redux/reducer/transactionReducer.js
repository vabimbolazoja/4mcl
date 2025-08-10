import {
  ERROR,
  LOADING_TRANSACTION,
  TRANSACTION_LIST,
  TRANSACTION_LIST_ACCOUNT,
  TRANSACTION_LIST_CARD,
  CHART_DATA,
  KUDANGNCHART_DATA,
  KLADOT_CHART,
} from "../action/types";

const initState = {
  loading: false,
  list: {},
  accTransList: {},
  transactionCardList: {},
  chartData: [],
  kudaNGNChartData: [],
  kladotChartData: {},
};

export function transactionReducer(state = initState, action) {
  switch (action.type) {
    case LOADING_TRANSACTION:
      return {
        ...state,
        loading: action.payload,
      };
    // chart data
    case CHART_DATA:
      return {
        ...state,
        chartData: action.payload,
      };
    // Kuda ngn chart data
    case KUDANGNCHART_DATA:
      return {
        ...state,
        kudaNGNChartData: action.payload,
      };
    // kladot us chart
    case KLADOT_CHART:
      return {
        ...state,
        kladotChartData: action.payload,
      };
    case TRANSACTION_LIST:
      return {
        ...state,
        loading: false,
        list: action.payload,
      };
    case TRANSACTION_LIST_CARD:
      return {
        ...state,
        loading: false,
        transactionCardList: action.payload,
      };

    case TRANSACTION_LIST_ACCOUNT:
      return {
        ...state,
        loading: false,
        accTransList: action.payload,
      };

    case ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
}
