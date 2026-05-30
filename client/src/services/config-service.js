import axios from "axios";
import config from "../config";

// Public guest endpoint — do not use serviceInstance (it adds Authorization when logged in,
// which triggers a CORS preflight that this route may not handle consistently).
const guestClient = axios.create({ baseURL: config.baseUrl });

const configService = {
  getConfigs: (data) =>
    guestClient
      .get("moderations/config", data)
      .then(({ data, status }) => ({
        ...data,
        status,
      })),

};

export default configService;
