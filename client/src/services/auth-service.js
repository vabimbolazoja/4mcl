import config from "../config";
import { serviceInstance } from "../interceptor/index";

const authService = {


    login: (request) =>
        serviceInstance.post(`${config.baseurl}login`, request).then(({ data }) => ({
            ...data,
        })),

    resendMailVerify: (request) =>
        serviceInstance.get(`${config.baseurl}resend-mail-verify?email=${request?.email}`, request).then(({ data }) => ({
            ...data,
        })),


    register: (data) =>
        serviceInstance
            .post(`${config.baseurl}register`, data)
            .then(({ data, status }) => ({
                ...data,
                status,
            })),

    verifyMail: (data) =>
        serviceInstance
            .get(`${config.baseurl}verify-mail?token=${data}`)
            .then(({ data, status }) => ({
                ...data,
                status,
            })),

    initiateForgotPassword: (data) =>
        serviceInstance
            .get(`${config.baseurl}forgot-password?email=${data?.email}`)
            .then(({ data, status }) => ({
                ...data,
                status,
            })),

    resetPassword: (data) =>
        serviceInstance
            .post(`${config.baseurl}reset-password?token=${data?.token}`, {password:data?.password})
            .then(({ data, status }) => ({
                ...data,
                status,
            })),

    logout: (request) =>
        serviceInstance
            .post(`${config.baseurl}/Account/Logout`, {})
            .then(({ data, status }) => ({
                ...data,
                status,
            })),
};

export default authService;