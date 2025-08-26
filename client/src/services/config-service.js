import config from "../config";
import { serviceInstance } from "../interceptor/index";

const configService = {
  getConfigs: (data) =>
    serviceInstance
      .get(`${config.baseUrl}moderations/config`)
      .then(({ data, status }) => ({
        ...data,
        status,
      })),

};

export default configService;
