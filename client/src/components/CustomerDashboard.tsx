import { useState, useEffect } from 'react';
import { Button, Card, Form, Input, InputNumber, message, Space, Statistic, Tabs, Table, Tag } from 'antd';
import { ArrowLeftOutlined, HistoryOutlined, SendOutlined, WalletOutlined } from '@ant-design/icons';
import { Customer } from '../types/customer';
import { customerAPI, transactionAPI } from '../services/api';
import abayLogo from '../assets/abayLogo.jpg';

interface CustomerDashboardProps {
  onBack: () => void;
}

function CustomerDashboard({ onBack }: CustomerDashboardProps) {
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loginForm] = Form.useForm();
  const [transactionForm] = Form.useForm();
  const [transferForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [receiverName, setReceiverName] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!currentCustomer) return;
    try {
      const response = await transactionAPI.getTransactions(currentCustomer.id);
      // Sort latest first
      const sortedTransactions = (response.data || []).sort((a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setTransactions(sortedTransactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  useEffect(() => {
    if (currentCustomer) {
      fetchTransactions();
    }
  }, [currentCustomer]);

  const handleCreateAccount = async (values: { name: string; phone: string; initialBalance: number }) => {
    setLoading(true);
    try {
      // Format phone number (remove any non-digit characters)
      const formattedPhone = values.phone.replace(/\D/g, '');

      const response = await customerAPI.create({
        fullName: values.name.trim(),
        phoneNumber: formattedPhone,
        balance: Number(values.initialBalance)
      });

      const newCustomer = response.data;
      setCurrentCustomer(newCustomer);
      setIsLoginView(false);
      createForm.resetFields();
      message.success('Account created successfully!');
    } catch (error) {
      console.error('Create account error:', error);
      message.error((error as any).response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (values: { amount: number }) => {
    if (!currentCustomer) return;
    setLoading(true);
    try {
      // Using the transaction API for deposit
      await transactionAPI.deposit({
        accountId: currentCustomer.id,
        amount: values.amount,
        description: 'Deposit'
      });
      const updatedCustomer = {
        ...currentCustomer,
        balance: currentCustomer.balance + values.amount
      };
      setCurrentCustomer(updatedCustomer);
      transactionForm.resetFields();
      fetchTransactions();
      message.success(`Deposited ETB ${values.amount} successfully!`);
    } catch (error) {
      console.error(error);
      message.error('Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (values: { amount: number }) => {
    if (!currentCustomer) return;
    if (values.amount > currentCustomer.balance) {
      message.error('Insufficient balance!');
      return;
    }
    setLoading(true);
    try {
      // Using the transaction API for withdrawal
      await transactionAPI.withdraw({
        accountId: currentCustomer.id,
        amount: values.amount,
        description: 'Withdrawal'
      });
      const updatedCustomer = {
        ...currentCustomer,
        balance: currentCustomer.balance - values.amount
      };
      setCurrentCustomer(updatedCustomer);
      transactionForm.resetFields();
      fetchTransactions();
      message.success(`Withdrawn ETB ${values.amount} successfully!`);
    } catch (error) {
      console.error(error);
      message.error('Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (values: { phone: string }) => {
    setLoading(true);
    try {
      const formattedPhone = values.phone.replace(/\D/g, '');
      const response = await customerAPI.login(formattedPhone);
      setCurrentCustomer(response.data);
      message.success('Welcome back!');
    } catch (error) {
      console.error(error);
      message.error('Customer not found with this phone number.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value.replace(/\D/g, '');
    if (phone.length >= 10) {
      try {
        const response = await transactionAPI.lookupCustomer(phone);
        setReceiverName(response.data.fullName);
      } catch (error) {
        setReceiverName(null);
      }
    } else {
      setReceiverName(null);
    }
  };

  const handleTransfer = async (values: { toPhone: string; amount: number }) => {
    if (!currentCustomer) return;
    if (values.amount > currentCustomer.balance) {
      message.error('Insufficient balance for transfer!');
      return;
    }
    setLoading(true);
    try {
      const formattedPhone = values.toPhone.replace(/\D/g, '');
      await transactionAPI.transfer({
        fromAccountId: currentCustomer.id,
        toPhoneNumber: formattedPhone,
        amount: values.amount
      });

      const updatedCustomer = {
        ...currentCustomer,
        balance: currentCustomer.balance - values.amount
      };
      setCurrentCustomer(updatedCustomer);
      transferForm.resetFields();
      setReceiverName(null);
      fetchTransactions();
      message.success(`Transferred ETB ${values.amount} successfully!`);
    } catch (error) {
      console.error(error);
      message.error((error as any).response?.data || 'Transfer failed. Check the phone number.');
    } finally {
      setLoading(false);
    }
  };

  const transactionColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type.includes('In') || type === 'Deposit' ? 'green' : 'red'}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <span className="font-semibold text-lg">
          ETB {amount.toFixed(2)}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          className="mb-6"
          size="large"
        >
          Back to Home
        </Button>

        <Card className="shadow-xl mb-6">
          <div className="flex items-center mb-4">
            <img src={abayLogo} alt="Abay Bank Logo" className="w-12 h-12 rounded-full mr-4 border border-gray-200 shadow-sm" />
            <h1 className="text-3xl font-bold text-gray-800">Customer Portal</h1>
          </div>
          <p className="text-gray-600">SOURCE OF GREATNESS - Manage your account and transactions</p>
        </Card>

        {!currentCustomer ? (
          <div className="flex flex-col gap-6">
            <Card title="Login to Your Account" className="shadow-lg max-w-md mx-auto w-full">
              <Form
                form={loginForm}
                layout="vertical"
                onFinish={handleLogin}
              >
                <Form.Item
                  label="Phone Number"
                  name="phone"
                  rules={[{ required: true, message: 'Please enter your phone number' }]}
                >
                  <Input size="large" placeholder="Enter your registered phone number" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" size="large" className="w-full bg-blue-600" loading={loading}>
                    Login
                  </Button>
                </Form.Item>
                <div className="text-center mt-4 text-gray-500">
                  <p>Don't have an account? Please contact an Abay Bank branch or authorized representative to open one.</p>
                </div>
              </Form>
            </Card>
          </div>
        ) : (
          <Space direction="vertical" size="large" className="w-full">
            <Card className="shadow-lg bg-gradient-to-r from-green-500 to-teal-600 text-white">
              {/* Existing Dashboard Header */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-green-100 mb-1">Account Holder</p>
                  <h2 className="text-2xl font-bold">{currentCustomer.fullName}</h2>
                  <p className="text-green-100 mt-2 text-sm">Account ID: {currentCustomer.id}</p>
                </div>
                <div>
                  <div className="text-2xl font-semibold mb-4">Welcome, {currentCustomer.fullName}!</div>
                  <div className="text-gray-600 mb-6">Phone: {currentCustomer.phoneNumber}</div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-green-400">
                <Statistic
                  title={<span className="text-green-100 text-lg">Current Balance</span>}
                  value={currentCustomer.balance}
                  precision={2}
                  prefix="ETB"
                  valueStyle={{ color: 'white', fontSize: '36px', fontWeight: 'bold' }}
                />
              </div>
            </Card>

            <Card className="shadow-lg">
              <Tabs
                defaultActiveKey="deposit"
                items={[
                  {
                    key: 'deposit',
                    label: <span><WalletOutlined /> Deposit</span>,
                    children: (
                      <Form
                        form={transactionForm}
                        layout="vertical"
                        onFinish={handleDeposit}
                        className="max-w-md"
                      >
                        <Form.Item
                          label="Amount to Deposit"
                          name="amount"
                          rules={[
                            { required: true, message: 'Please enter amount' },
                            { type: 'number', min: 0.01, message: 'Amount must be greater than 0' }
                          ]}
                        >
                          <InputNumber
                            size="large"
                            className="w-full"
                            placeholder="Enter amount"
                            prefix="ETB"
                            min={0}
                          />
                        </Form.Item>
                        <Form.Item>
                          <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            className="w-full bg-green-600 hover:bg-green-700"
                            loading={loading}
                          >
                            Deposit Money
                          </Button>
                        </Form.Item>
                      </Form>
                    ),
                  },
                  {
                    key: 'withdraw',
                    label: <span><ArrowLeftOutlined rotate={-45} /> Withdraw</span>,
                    children: (
                      <Form
                        layout="vertical"
                        onFinish={handleWithdraw}
                        className="max-w-md"
                      >
                        <Form.Item
                          label="Amount to Withdraw"
                          name="amount"
                          rules={[
                            { required: true, message: 'Please enter amount' },
                            { type: 'number', min: 0.01, message: 'Amount must be greater than 0' }
                          ]}
                        >
                          <InputNumber
                            size="large"
                            className="w-full"
                            placeholder="Enter amount"
                            prefix="ETB"
                            min={0}
                          />
                        </Form.Item>
                        <Form.Item>
                          <Button
                            type="primary"
                            danger
                            htmlType="submit"
                            size="large"
                            className="w-full"
                            loading={loading}
                          >
                            Withdraw Money
                          </Button>
                        </Form.Item>
                      </Form>
                    ),
                  },
                  {
                    key: 'transfer',
                    label: <span><SendOutlined /> Send Money</span>,
                    children: (
                      <Form
                        form={transferForm}
                        layout="vertical"
                        onFinish={handleTransfer}
                        className="max-w-md"
                      >
                        <Form.Item
                          label="Receiver Phone Number"
                          name="toPhone"
                          rules={[
                            { required: true, message: 'Please enter receiver phone number' },
                            { pattern: /^[0-9]{10,}$/, message: 'Please enter a valid phone number' }
                          ]}
                          help={receiverName && <span className="text-blue-600 font-semibold">Receiver: {receiverName}</span>}
                        >
                          <Input
                            size="large"
                            placeholder="Enter Phone Number"
                            onChange={handlePhoneChange}
                          />
                        </Form.Item>
                        <Form.Item
                          label="Amount to Transfer"
                          name="amount"
                          rules={[
                            { required: true, message: 'Please enter amount' },
                            { type: 'number', min: 0.01, message: 'Amount must be greater than 0' }
                          ]}
                        >
                          <InputNumber
                            size="large"
                            className="w-full"
                            placeholder="Enter amount"
                            prefix="ETB"
                            min={0}
                          />
                        </Form.Item>
                        <Form.Item>
                          <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            className="w-full bg-blue-600"
                            loading={loading}
                          >
                            Transfer Now
                          </Button>
                        </Form.Item>
                      </Form>
                    ),
                  },
                  {
                    key: 'history',
                    label: <span><HistoryOutlined /> Transaction History</span>,
                    children: (
                      <Table
                        dataSource={transactions}
                        columns={transactionColumns}
                        rowKey="id"
                        pagination={{ pageSize: 5 }}
                        className="mt-4"
                      />
                    ),
                  },
                ]}
              />
            </Card>

            <Button
              type="default"
              size="large"
              onClick={() => {
                setCurrentCustomer(null);
                loginForm.resetFields();
                transactionForm.resetFields();
              }}
              className="w-full"
            >
              Logout
            </Button>
          </Space>
        )}
      </div>
    </div>
  );
}

export default CustomerDashboard;