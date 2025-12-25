// client/src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5291/api', // or your API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(response => {
  if (response.data && response.data.$values) {
    response.data = response.data.$values;
  }
  return response;
});

// Customer API
export const customerAPI = {
  login: (phoneNumber: string) => api.post('/customer/login', { phoneNumber }),

  create: (data: { fullName: string; phoneNumber: string; balance: number }) =>
    api.post('/customer/create', data),

  deposit: (accountId: string, amount: number) =>
    api.post(`/customer/deposit/${accountId}`, { amount }),

  withdraw: (accountId: string, amount: number) =>
    api.post(`/customer/withdraw/${accountId}`, { amount }),
};

// Banker API
export const bankerAPI = {
  getCustomers: () => api.get('/banker/customers'),

  // Update customer information
  updateCustomer: (id: string, data: { fullName?: string; phoneNumber?: string }) =>
    api.put(`/banker/customer/${id}`, data),

  deleteCustomer: (id: string) =>
    api.delete(`/banker/customer/${id}`),
};

// Account API
export const accountAPI = {
  getAccount: (id: string) => api.get(`/Accounts/${id}`),

  deposit: (id: string, amount: number) =>
    api.post(`/Accounts/${id}/deposit`, { amount }),

  withdraw: (id: string, amount: number) =>
    api.post(`/Accounts/${id}/withdraw`, { amount }),

  getTransactions: (id: string) =>
    api.get(`/Accounts/${id}/transactions`),
};

// Transactions API
// Transaction API
export const transactionAPI = {
  deposit: (data: { accountId: number; amount: number; description: string }) =>
    api.post(`/accounts/${data.accountId}/deposit`, data.amount),

  withdraw: (data: { accountId: number; amount: number; description: string }) =>
    api.post(`/accounts/${data.accountId}/withdraw`, data.amount),

  transfer: (data: { fromAccountId: number; toAccountId?: number; toPhoneNumber?: string; amount: number }) =>
    api.post('/accounts/transfer', data),

  getTransactions: (accountId: number) =>
    api.get(`/accounts/${accountId}/transactions`),

  lookupCustomer: (phoneNumber: string) =>
    api.get(`/accounts/lookup/${phoneNumber}`),
};

export default api;