import config from "../config";
import { serviceInstance } from "../interceptor/index";

const messageService = {
  fetchMessages: (queryString) =>
    serviceInstance
      .get(`${config.baseUrl}/api/v1/notification/`)
      .then(({ data }) => ({
        ...data,
      })),

  readMessage: (data) =>
    serviceInstance
      .put(`${config.baseUrl}/api/v1/notification/mark-read`, data)
      .then(({ data }) => ({
        ...data,
      })),

  addMessage: (data) =>
    serviceInstance
      .post(`${config.baseUrl}/api/v1/notification`, data)
      .then(({ data }) => ({
        ...data,
      })),

  addChatInstance: (data) =>
    serviceInstance
      .post(`${config.baseUrl}/api/v1/notification`, data)
      .then(({ data }) => ({
        ...data,
      })),
};

export default messageService;
