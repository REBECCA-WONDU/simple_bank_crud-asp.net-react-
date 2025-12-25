import { lazy } from 'react';

const HomePage = lazy(() => import('./pages/HomePage'));
const CustomerDashboard = lazy(() => import('./pages/Customer/CustomerDashboard'));
const BankerDashboard = lazy(() => import('./pages/Banker/BankerDashboard'));
const AccountSummary = lazy(() => import('./pages/Customer/components/AccountSummary'));
const CreateAccount = lazy(() => import('./pages/Customer/components/CreateAccount'));
const Deposit = lazy(() => import('./pages/Customer/components/Deposit'));
const Withdraw = lazy(() => import('./pages/Customer/components/Withdraw'));
const Transactions = lazy(() => import('./pages/Customer/components/Transactions'));

export const routes = [
  {
    path: '/',
    element: <HomePage />,
    exact: true
  },
  {
    path: '/customer',
    element: <CustomerDashboard />,
    children: [
      {
        index: true,
        element: <AccountSummary />
      },
      {
        path: 'create-account',
        element: <CreateAccount />
      },
      {
        path: 'deposit',
        element: <Deposit />
      },
      {
        path: 'withdraw',
        element: <Withdraw />
      },
      {
        path: 'transactions',
        element: <Transactions />
      }
    ]
  },
  {
    path: '/banker/*',
    element: <BankerDashboard />
  },
  {
    path: '*',
    element: <HomePage />
  }
];
