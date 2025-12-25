// In CustomerDashboard.tsx
import { useState } from 'react';
import { Button, Card, Form, Input, InputNumber, message, Space, Statistic, Tabs } from 'antd';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import { Customer } from '../types/customer';
import { customerAPI, transactionAPI } from '../services/api';

interface CustomerDashboardProps {
  onBack: () => void;
}

function CustomerDashboard({ onBack }: CustomerDashboardProps) {
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [isLoginView, setIsLoginView] = useState(true);
  const [loginForm] = Form.useForm();
  const [createForm] = Form.useForm();
  const [transactionForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Removed auto-select useEffect

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
      message.success(`Deposited $${values.amount} successfully!`);
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
      message.success(`Withdrawn $${values.amount} successfully!`);
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
      setIsLoginView(false);
      message.success('Welcome back!');
    } catch (error) {
      console.error(error);
      message.error('Customer not found with this phone number.');
    } finally {
      setLoading(false);
    }
  };

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
            <UserOutlined className="text-3xl text-green-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">Customer Portal</h1>
          </div>
          <p className="text-gray-600">Manage your account and transactions</p>
        </Card>

        {!currentCustomer ? (
          <div className="flex flex-col gap-6">
            <Card title={isLoginView ? "Login to Your Account" : "Create New Account"} className="shadow-lg max-w-md mx-auto w-full">
              {isLoginView ? (
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
                  <div className="text-center mt-4">
                    <Button type="link" onClick={() => setIsLoginView(false)}>
                      New here? Create an account
                    </Button>
                  </div>
                </Form>
              ) : (
                <>
                  <Form
                    form={createForm}
                    layout="vertical"
                    onFinish={handleCreateAccount}
                  >
                    <Form.Item
                      label="Full Name"
                      name="name"
                      rules={[{ required: true, message: 'Please enter your name' }]}
                    >
                      <Input size="large" placeholder="Enter your full name" />
                    </Form.Item>

                    <Form.Item
                      label="Phone Number"
                      name="phone"
                      rules={[
                        { required: true, message: 'Please enter your phone number' },
                        { pattern: /^[0-9]{10,}$/, message: 'Please enter a valid phone number' }
                      ]}
                    >
                      <Input size="large" placeholder="Enter your phone number" />
                    </Form.Item>

                    <Form.Item
                      label="Initial Balance"
                      name="initialBalance"
                      rules={[
                        { required: true, message: 'Please enter initial balance' },
                        { type: 'number', min: 0, message: 'Balance must be positive' }
                      ]}
                    >
                      <InputNumber
                        size="large"
                        className="w-full"
                        placeholder="Enter initial deposit amount"
                        prefix="$"
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
                        Create Account
                      </Button>
                    </Form.Item>
                  </Form>
                  <div className="text-center mt-4">
                    <Button type="link" onClick={() => setIsLoginView(true)}>
                      Already have an account? Login
                    </Button>
                  </div>
                </>
              )}
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
                  prefix="$"
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
                    label: 'Deposit Money',
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
                            prefix="$"
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
                    label: 'Withdraw Money',
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
                            prefix="$"
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
                ]}
              />
            </Card>

            <Button
              type="default"
              size="large"
              onClick={() => {
                setCurrentCustomer(null);
                setIsLoginView(true);
                createForm.resetFields();
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