import config from "../config";
import { serviceInstance } from "../interceptor/index";

const contactService = {
  fetchContact: async (type,accId) => {
    const { data } = await serviceInstance.get(
      type === undefined
        ? `${config.neoBankingUrl}/api/v1/contact/all?accountId=${accId}`
        : `${config.neoBankingUrl}/api/v1/contact/all/filter?type=${type}&accountId=${accId}`
    );
    return data;
  },
  fetchContactInfo: async (contactid) => {
    const { data } = await serviceInstance.get(`${config.neoBankingUrl}/api/v1/contact/details/${contactid}`
    );
    return data;
  },

  removeContact: async (id) => {
    const { data } = await serviceInstance.delete(
      `${config.neoBankingUrl}/api/v1/contact/remove/${id}`
    );
    return data;
  },

  createContact: (data) =>
    serviceInstance
      .post(`${config.neoBankingUrl}/api/v1/contact/add`, data)
      .then(({ data, status }) => ({
        ...data,
        status,
      })),

  createContactDebitCard: (data) =>
    serviceInstance
      .post(`${config.neoBankingUrl}/api/v1/contact/add/debit-card`, data)
      .then(({ data, status }) => ({
        ...data,
        status,
      })),
  getUserInfo: (phone) =>
    serviceInstance
      .get(`${config.neoBankingUrl}/api/v1/person/${phone}`)
      .then(({ data, status }) => ({
        ...data,
        status,
      })),
};

export default contactService;
