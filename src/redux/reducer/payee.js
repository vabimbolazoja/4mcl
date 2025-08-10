import {
  ERROR,
  LOADING_EMPLOYEE,
  INVITE_EMPLOYEE,
  FETCH_STAFF_INVITES,
  TREAT_INVITE,
  JOIN_COMPANY,
  TREAT_JOIN_REQUEST,
  COMPANIES,
  GET_JOIN_REQUEST,
  FETCH_ALL_STAFF,
  INSTANT_PAYMENT,
  PAYMENT_TRANSACTIONS,
  CREATE_PLANS,
  UPDATE_PLAN,
  GET_PLANS,
  ACTIVATE_PLAN,
  SUSPEND_PLAN,
  DELETE_PLAN,
  FETCH_STAFF_SCHEDULE,
  CREATE_STAFF_SCHEDULE,
  UPDATE_STAFF_SCHEDULE,
  REMOVE_STAFF_SCHEDULE,
  COMPANY_STATISTICS,
  DELETE_EMPLOYEE,
  FETCH_COMPANY_INVITES,
  TRANSACTION_VOLUME,
  TRANSACTION_VOLUME_ONE,
  TRANSACTION_VOLUME_TWO,
  TRANSACTION_VOLUME_THREE,
  TRANSACTION_VOLUME_FOUR,
  TRANSACTION_VOLUME_FIVE,
} from "../action/types";

const initState = {
  loading: false,
  invite: {},
  staffInvite: {},
  companyInvite: {},
  treat: {},
  join: {},
  treatJoin: {},
  companies: {},
  joinRequest: {},
  allStaff: {},
  instantPa: {},
  paymentTransactions: {},
  planCreated: {},
  planUpdated: {},
  getPlans: {},
  activate: {},
  suspend: {},
  deleteP: {},
  fetchSchedule: {},
  createSchedule: {},
  updateSchedule: {},
  removeSchedule: {},
  stats: {},
  transVol1: {},
  transVol2: {},
  transVol3: {},
  transVol4: {},
  transVol5: {},
  deleteStaff: {},
};

export function payeeReducer(state = initState, action) {
  switch (action.type) {
    case LOADING_EMPLOYEE:
      return {
        ...state,
        loading: true,
      };

    case INVITE_EMPLOYEE:
      return {
        ...state,
        loading: false,
        invite: action.payload,
      };

    case FETCH_STAFF_INVITES:
      return {
        ...state,
        loading: false,
        staffInvite: action.payload,
      };

    case FETCH_COMPANY_INVITES:
      return {
        ...state,
        loading: false,
        companyInvite: action.payload,
      };

    case TREAT_INVITE:
      return {
        ...state,
        loading: false,
        treat: action.payload,
      };

    case JOIN_COMPANY:
      return {
        ...state,
        loading: false,
        join: action.payload,
      };

    case TREAT_JOIN_REQUEST:
      return {
        ...state,
        loading: false,
        treatJoin: action.payload,
      };

    case COMPANIES:
      return {
        ...state,
        loading: false,
        companies: action.payload,
      };

    case GET_JOIN_REQUEST:
      return {
        ...state,
        loading: false,
        joinRequest: action.payload,
      };

    case FETCH_ALL_STAFF:
      return {
        ...state,
        loading: false,
        allStaff: action.payload,
      };

    case INSTANT_PAYMENT:
      return {
        ...state,
        loading: false,
        instantPay: action.payload,
      };

    case PAYMENT_TRANSACTIONS:
      return {
        ...state,
        loading: false,
        paymentTransactions: action.payload,
      };
    case CREATE_PLANS:
      return {
        ...state,
        loading: false,
        planCreated: action.payload,
      };
    case UPDATE_PLAN:
      return {
        ...state,
        loading: false,
        planUpdated: action.payload,
      };
    case GET_PLANS:
      return {
        ...state,
        loading: false,
        getPlans: action.payload,
      };
    case ACTIVATE_PLAN:
      return {
        ...state,
        loading: false,
        activate: action.payload,
      };
    case SUSPEND_PLAN:
      return {
        ...state,
        loading: false,
        suspend: action.payload,
      };
    case DELETE_PLAN:
      return {
        ...state,
        loading: false,
        deleteP: action.payload,
      };
    case FETCH_STAFF_SCHEDULE:
      return {
        ...state,
        loading: false,
        fetchSchedule: action.payload,
      };

    case CREATE_STAFF_SCHEDULE:
      return {
        ...state,
        loading: false,
        createSchedule: action.payload,
      };

    case UPDATE_STAFF_SCHEDULE:
      return {
        ...state,
        loading: false,
        updateSchedule: action.payload,
      };

    case REMOVE_STAFF_SCHEDULE:
      return {
        ...state,
        loading: false,
        removeSchedule: action.payload,
      };
    case COMPANY_STATISTICS:
      return {
        ...state,
        loading: false,
        stats: action.payload,
      };
    case TRANSACTION_VOLUME_ONE:
      return {
        ...state,
        loading: false,
        transVol1: action.payload,
      };
    case TRANSACTION_VOLUME_TWO:
      return {
        ...state,
        loading: false,
        transVol2: action.payload,
      };
    case TRANSACTION_VOLUME_THREE:
      return {
        ...state,
        loading: false,
        transVol3: action.payload,
      };
    case TRANSACTION_VOLUME_FOUR:
      return {
        ...state,
        loading: false,
        transVol4: action.payload,
      };
    case DELETE_EMPLOYEE:
      return {
        ...state,
        loading: false,
        deleteStaff: action.payload,
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
