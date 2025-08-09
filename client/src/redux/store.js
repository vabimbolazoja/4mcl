import { createStore, compose, applyMiddleware } from "redux";
import thunk from "redux-thunk";
// import { createLogger } from "redux-logger";
import rootReducer from "./reducer/index";

// const logger = createLogger();
// You can un-comment it when you want to use the logger. I'll change the configuration not to show in production environment later

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const configureStore = () => {
  return createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)));
};

export default configureStore;
