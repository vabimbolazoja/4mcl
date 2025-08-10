import config from "../config";
import { serviceInstance } from "../interceptor/index";

const productService = {
    getConfigs: (data) =>
        serviceInstance
            .get(`${config.baseUrl}/api/products`, data)
            .then(({ data, status }) => ({
                ...data,
                status,
            })),
    getProductDetail: (data) =>
        serviceInstance
            .get(`${config.baseUrl}/api/product/${data?.id}`, data)
            .then(({ data, status }) => ({
                ...data,
                status,
            })),

};

export default productService;
