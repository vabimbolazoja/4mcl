import { combineReducers } from "redux";
import appReducer from "./App/baseReducer";
import authReducer from "./App/authReducer";
import askReducer from "./askReducer";
import defaultReducer from "./default";
import { userReducer } from "./userReducer";
import { persistReducer } from "redux-persist";
import storageSession from "redux-persist/lib/storage/session";
import { kycReducer } from "./kycReducer";
import { walletReducer } from "./walletReducer";
import { settingsReducer } from "./settingsReducer";
import { transactionReducer } from "./transactionReducer";
import { bidReducer } from "./bidReducer";
import { messageReducer } from "./messagesReducer";
import { websiteReducer } from "./websiteReducer";
import { iachReducer } from "./iachReducer";
import { blogReducer } from "./blogReducer";
import { payeeReducer } from "./payee";
import { configReducer } from "./configReducer";
import { sendMoneyReducer } from "./sendMoneyReducer";
import { contactReducer } from "./contact-reducer";
import { plaidReducer } from "./plaidReducer";
import { paymentRequestReducer } from "./paymentrequest";
import {cartReducer} from "./cartReducer"

const persistConfig = {
  key: "root",
  storage: storageSession,
  whitelist: ["user"],
};

const rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  system: defaultReducer,
  user: userReducer,
  ask: askReducer,
  kyc: kycReducer,
  wallet: walletReducer,
  messages: messageReducer,
  settings: settingsReducer,
  plaid: plaidReducer,
  transaction: transactionReducer,
  bid: bidReducer,
  website: websiteReducer,
  iach: iachReducer,
  blog: blogReducer,
  payee: payeeReducer,
  configs: configReducer,
  sendMoney: sendMoneyReducer,
  cart: cartReducer,
  contact: contactReducer,
  paymentRequest: paymentRequestReducer,
});

export default persistReducer(persistConfig, rootReducer);
