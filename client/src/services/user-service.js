import config from "../config";
import { serviceInstance } from "../interceptor/index";

const userService = {
  fetchProfile: (id) =>
    serviceInstance
      .get(`${config.baseUrl}user-details/${id}`)
      .then(({ data, status }) => ({
        ...data,
        status,
      })),

  fetchConfigs: (id) =>
    serviceInstance
      .get(`${config.baseUrl}admin/configs`)
      .then(({ data, status }) => ({
        ...data,
        status,
      })),
  fetchConfigsNgn: (id) =>
    serviceInstance
      .get(`${config.baseUrl}admin/configs-ngn`)
      .then(({ data, status }) => ({
        ...data,
        status,
      })),

  verifyPay: (id, ref) =>
    serviceInstance
      .post(`${config.baseUrl}verify-order`, { ref, id })
      .then(({ data, status }) => ({
        ...data,
        status,
      })),
};

export default userService;
