import config from "../config";
import { serviceInstance } from "../interceptor/index";

const paymentService = {


    initiate: (request) =>
        serviceInstance.post(`${config.baseurl}order/initiate`, request).then(({ data }) => ({
            ...data,
        })),
        

    verify: (request) =>
        serviceInstance.post(`${config.baseurl}order/verify`, request).then(({ data }) => ({
            ...data,
        })),


   
};

export default paymentService;