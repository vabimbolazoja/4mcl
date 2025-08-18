import config from "../config";
import { serviceInstance } from "../interceptor/index";

const authService = {


    trackOrder: (request) =>
        serviceInstance.get(`${config.baseurl}orders/guest/${request}`).then(({ data }) => ({
            ...data,
        })),

   
};

export default authService;