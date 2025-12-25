export interface Customer {
  id: string;
  fullName: string;
  phoneNumber: string;
  balance: number;
  createdAt: string;
  accounts?: Array<{
    id: string;
    balance: number;
    accountNumber: string;
  }>;
}
