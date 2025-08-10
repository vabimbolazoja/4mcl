import {
  ERROR,
  LOADING_WEBSITE,
  ASK_INQUIRY,
  RESET_APP,
  SWITCH_APP,
  ADD_TO_CART,
  REMOVE_ITEM,
  EMPTY_CART,
  CLEAR_CART,
  SUB_CART,
  ADD_CART,
  SHOPPING_ORIGIN,
} from "../action/types";
import Cookie from "js-cookie";
var parseCart = sessionStorage?.getItem("cartItems");
var jsonparse =  JSON?.parse(parseCart)
const carts = jsonparse ? jsonparse : [];

console.log(carts);
const initState = {
  loading: false,
  inquiry: {},
  cartItems: carts,
  app: 0,
};

export function cartReducer(state = initState, action) {
  switch (action.type) {
    case ADD_TO_CART:
      console.log(action.payload);
      const item = action.payload;
      const product = state.cartItems?.find(
        (x) => x.catalogueId === item.catalogueId
      );
      if (product) {
        return {
          cartItems: state.cartItems.map((x) =>
            x.catalogueId === product.catalogueId ? item : x
          ),
        };
      } else {
        return {
          cartItems: [...state.cartItems, item],
        };
      }
    case REMOVE_ITEM:
      var nxtArr = state.cartItems.filter(
        (x) => x.catalogueId !== action.payload
      );
      return {
        cartItems: state.cartItems.filter(
          (x) => x.catalogueId !== action.payload
        ),
      };

    case ADD_CART:
      var arri = state.cartItems;
      let objIndex = arri.findIndex((obj) => obj.id == action.payload);
      arri[objIndex].qty = Number(arri[objIndex].qty + 1);
      arri[objIndex].subtotal = arri[objIndex].qty * arri[objIndex].unitPrice;

      return {
        cartItems: arri,
      };

    case SUB_CART:
      var arr = state.cartItems;
      let objIndexi = arr.findIndex((obj) => obj.id == action.payload?.id);
      arr[objIndexi].qty = Math.max(arr[objIndexi].qty - 1, 0);
      arr[objIndexi].subtotal = arr[objIndexi].unitPrice * arr[objIndexi].qty;
      return {
        cartItems: arr,
      };

    case EMPTY_CART:
      return {
        cartItems: [],
      };

    default:
      return state;
  }
}
