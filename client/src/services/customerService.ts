import api from './api';
import { Customer } from '../types/customer';

export const customerService = {
    // Get all customers for the banker dashboard
    getAllCustomers: async (): Promise<Customer[]> => {
        const response = await api.get('/banker/customers');
        return response.data;
    },

    // Update customer information
    updateCustomer: async (id: number, fullName: string, phoneNumber: string): Promise<Customer> => {
        const response = await api.put(`/banker/customer/${id}`, {
            fullName: fullName,
            phoneNumber: phoneNumber
        });
        return response.data;
    },

    deleteCustomer: async (id: number): Promise<void> => {
        await api.delete(`/banker/customer/${id}`);
    },

    // Create a new customer
    createCustomer: async (data: { fullName: string; phoneNumber: string; password: string; balance: number }): Promise<Customer> => {
        const response = await api.post('/customer/create', data);
        return response.data;
    },

    // Banker deposit
    deposit: async (id: number, amount: number): Promise<void> => {
        await api.post(`/banker/deposit/${id}`, { amount });
    },

    // Banker withdraw
    withdraw: async (id: number, amount: number): Promise<void> => {
        await api.post(`/banker/withdraw/${id}`, { amount });
    }
};
