import config from "../config";
import { serviceInstance } from "../interceptor/index";

const transactionService = {
  fetchTransactions: (type, queryString) =>
    serviceInstance
      .get(`${config.baseUrl}/api/v1/transactions/${type}?${queryString} `)
      .then(({ data, status }) => ({
        ...data,
        status,
      })),

  fetchTransactionsAccount: (accId, offset, limit, startdate, enddate) =>
    serviceInstance
      .post(
        `${config.neoBankingUrl}/api/v1/deep-blue-gate/account/filter?${startdate}&${enddate}`,
        {
          accountId: accId,
          limit: limit,
          offset: offset,
        }
      )
      .then(({ data, status }) => ({
        ...data,
        status,
      })),
  // kladot US chart
  fetchUSKladotChartTransaction: (accId, limit, offset) =>
    serviceInstance
      .post(`${config.neoBankingUrl}/api/v1/deep-blue-gate/account/chart`, {
        accountId: accId,
        limit: limit || 10,
        offset: offset || 0,
      })
      .then(({ data, status }) => ({
        ...data,
        response: data,
        status,
      })),
  fetchChartTransaction: (accId, queryString) =>
    serviceInstance
      .get(
        `${config.neoBankingUrl}/api/v1/solidifi/transaction/account/filter/${accId}?${queryString}`
      )
      .then(({ data, status }) => ({
        ...data,
        response: data,
        status,
      })),
  fetchNGNKudaChartTransaction: (startDate, endDate) =>
    serviceInstance
      .get(
        `${config.neoBankingUrl}/purple-gate/chart-data?startDate=${startDate}&endDate=${endDate}`
      )
      .then(({ data, status }) => ({
        ...data,
        response: data,
        status,
      })),

  fetchCardTransactions: (queryString) =>
    serviceInstance
      .get(`${config.baseUrl}/api/v1/virtual-card/card/history`)
      .then(({ data, status }) => ({
        ...data,
        status,
      })),
};

export default transactionService;
