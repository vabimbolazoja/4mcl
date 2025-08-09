import axios from "axios";
import config from "../config";

export const serviceInstance = axios.create({
  baseURL: config.baseUrl,
  headers: {
    // "Access-Control-Allow-Origin": "*",
    post: {
      "Content-Type": "application/json",
    },
  },
});

const accessToken = window.sessionStorage.getItem("token");
if (accessToken) {
  serviceInstance.defaults.headers.common[
    "Authorization"
  ] = `Bearer ${accessToken}`;
}

export const setToken = (token) => {
  if (token) {
    serviceInstance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${token}`;
  }
};
