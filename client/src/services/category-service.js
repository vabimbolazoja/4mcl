import config from "../config";
import { serviceInstance } from "../interceptor/index";

const categoryService = {
  getConfigs: (data) =>
    serviceInstance
      .get(`${config.baseUrl}/api/v1/configurations`, data)
      .then(({ data, status }) => ({
        ...data,
        status,
      })),

};

export default categoryService;
