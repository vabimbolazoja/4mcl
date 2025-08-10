import {
    ASKS,
    BIDS,
    COUNTRY,
    WALLET,
    GET_PRESETS,
    BASE_CONFIGS,
    TRANSACTION_STATUS,
    READ_CHAT,
    SET_PICTURE,
    ADD_USER_CHAT,
    EXCHANGE_STATUS,
    CHAT_DATA,
    NEW_MSG,
    BLOGS,
    REFRESH
} from '../../action/types'

export default function(
    state = {
        wallet: sessionStorage.getItem('userCountry') === 'NIGERIA' ? '0' : '1',
        country: '',
        bids: [],
        blogs: [],
        asks: [],
        transStatus: [],
        exchangeStatus: [],
        user_picture: "",
        baseConfigs: [],
        chatLists: [],
        userAdded: false,
        chatData: {},
        chatMessage: [],
        incomingUserChat: '',
        presets: [],
        onAddedChat: false,
        refresh: false
    },
    action
    ) {
    switch (action.type) {
        case WALLET:
        return {
            ...state,
            wallet: action.payload
        }

        case COUNTRY:
        return {
            ...state,
            country: action.payload
        }
        case BIDS:
        return {
            ...state,
            bids: action.payload
        }
        case ASKS:
        return {
            ...state,
            asks: action.payload
        }
        case TRANSACTION_STATUS:
        return {
            ...state,
            transStatus: action.payload
        }
        case EXCHANGE_STATUS:
        return {
            ...state,
            exchangeStatus: action.payload
        }
       
        case SET_PICTURE:
        return {
            ...state,
            user_picture: action.payload
        }

        case BASE_CONFIGS:
        return {
            ...state,
            baseConfigs: action.payload
        }
        case CHAT_DATA:
        return {
            ...state,
            chatData: action.payload
        }
        case REFRESH:
        return {
            ...state,
            refresh: action.payload.refreshStatus
        }

        case GET_PRESETS:
        return {
            ...state,
            presets: action.payload
        }
        case BLOGS:
        return {
            ...state,
            blogs: action.payload
        }
        case READ_CHAT:
        const filetredChat = state.chatData ? state.chatData[action.payload] : []
        return {
            ...state,
            chatMessage: filetredChat,
            incomingUserChat: action.payload
        }
        case NEW_MSG:
        var newChat = state.chatData ? state.chatData[action.payload.user] : []
        var newData = {
            message: action.payload.msg,
            initiation: 'OUT',
            read: false
        }

        return {
            ...state,
            chatMessage: [newData, ...newChat],
            incomingUserChat: action.payload.user,
            onAddedChat: true
        }

        case ADD_USER_CHAT:
            // var user = action.payload;
            // var users = state.chatData;
            return {
                ...state,
                userAdded: action.payload

            }

            default:
            return state
        }
    }