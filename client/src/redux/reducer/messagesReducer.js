import {
  ERROR,
  MESSAGES,
  LOADING_MESSAGES,
  IS_READ,
  READ_MESSAGE,
  ADD_MESSAGE
} from "../action/types";

const initState = {
  loading: false,
  messages: {},
  incomingUserChat: "",
  isRead: "",
  chatMessage: {},
  onAddedChat: false
};

export function messageReducer(state = initState, action) {
  switch (action.type) {
    case LOADING_MESSAGES:
      return {
        ...state,
        loading: true,
        onAddedChat: false,

      };

    case MESSAGES:
      return {
        ...state,
        loading: false,
        onAddedChat: false,

        messages: action.payload,
      };
    case READ_MESSAGE:
      const filetredChat = state.messages ? state.messages[action.payload] : [];
      return {
        ...state,
        chatMessage: filetredChat,
        loading: false,
        onAddedChat: false,

        incomingUserChat: action.payload,
      };
    case IS_READ:
      return {
        ...state,
        isRead: action.payload,
        loading: false,
        onAddedChat: false,

      };

      case ADD_MESSAGE:
      var newChat = state.messages ? state.messages[action.payload.user] : [];
      var newData = {
        message: action.payload.msg,
        initiation: "OUT",
        loading: false,
        read: false,
      };

      return {
        ...state,
        chatMessage: [newData, ...newChat],
        incomingUserChat: action.payload.user,
        onAddedChat: true,
        loading: false,

      };
    case ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
        onAddedChat: false,

      };

    default:
      return state;
  }
}
