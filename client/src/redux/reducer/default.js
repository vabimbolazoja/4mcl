const initialStatee = {
    sidebarShow: 'responsive'
}

export default function(state = initialStatee, { type, ...rest }) {
    switch (type) {
        case 'set':
            return {...state, ...rest }
        default:
            return state
    }
}