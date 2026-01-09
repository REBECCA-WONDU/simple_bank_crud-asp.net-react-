import { useEffect, useState } from 'react';
import { Button, Card, Form, Input, InputNumber, message, Modal, Space, Statistic, Table, Tag } from 'antd';
import { ArrowLeftOutlined, BankOutlined, DeleteOutlined, EditOutlined, DollarOutlined, LineChartOutlined } from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { customerService } from '../services/customerService';
import { bankerAPI } from '../services/api';
import { Customer } from '../types/customer';
import abayLogo from '../assets/abayLogo.jpg';

interface BankerDashboardProps {
  onBack: () => void;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

function BankerDashboard({ onBack, customers, setCustomers }: BankerDashboardProps) {
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  //Ant Design form instances for validation and resetting fields
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const [transactionForm] = Form.useForm();

  const [transactionModalVisible, setTransactionModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [dailyStats, setDailyStats] = useState<any[]>([]);

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await bankerAPI.getDailyStats(7);
      setDailyStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const allCustomers = await customerService.getAllCustomers();
      setCustomers(allCustomers);
    } catch (error) {
      message.error('Failed to load customers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const activeCustomers = customers.filter(c => c.status === 'Active' || !c.status).length;
  const frozenCustomers = customers.filter(c => c.status === 'Frozen').length;
  const totalBalance = customers.reduce((sum, customer) => sum + customer.balance, 0);

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    form.setFieldsValue({
      name: customer.fullName,
      phone: customer.phoneNumber,
    });
    setIsModalVisible(true);
  };

  const handleUpdate = async (values: { name: string; phone: string }) => {
    if (!editingCustomer) return;
    setLoading(true);
    try {
      const updatedCustomer = await customerService.updateCustomer(
        editingCustomer.id,
        values.name,
        values.phone
      );
      if (updatedCustomer) {
        const updatedCustomers = customers.map(c =>
          c.id === editingCustomer.id ? { ...c, ...updatedCustomer } : c
        );
        setCustomers(updatedCustomers);
        message.success('Customer information updated successfully!');
        setIsModalVisible(false);
        setEditingCustomer(null);
        form.resetFields();
      }
    } catch (error) {
      message.error('Failed to update customer');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: { name: string; phone: string; password: string; initialBalance: number }) => {
    setLoading(true);
    try {
      const newCustomer = await customerService.createCustomer({
        fullName: values.name,
        phoneNumber: values.phone,
        password: values.password,
        balance: values.initialBalance
      });
      setCustomers([...customers, newCustomer]);
      message.success('Customer account created successfully!');
      setIsCreateModalVisible(false);
      createForm.resetFields();
    } catch (error) {
      message.error((error as any).response?.data || 'Failed to create customer');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransaction = async (values: { amount: number }) => {
    if (!selectedCustomer) return;
    setLoading(true);
    try {
      if (transactionType === 'deposit') {
        await customerService.deposit(selectedCustomer.id, values.amount);
        message.success(`Deposited ETB ${values.amount} to ${selectedCustomer.fullName}`);
      } else {
        if (values.amount > selectedCustomer.balance) {
          message.error('Insufficient balance');
          setLoading(false);
          return;
        }
        await customerService.withdraw(selectedCustomer.id, values.amount);
        message.success(`Withdrawn ETB ${values.amount} from ${selectedCustomer.fullName}`);
      }

      // Update local state
      const updatedCustomers = customers.map(c =>
        c.id === selectedCustomer.id
          ? { ...c, balance: transactionType === 'deposit' ? c.balance + values.amount : c.balance - values.amount }
          : c
      );
      setCustomers(updatedCustomers);
      setTransactionModalVisible(false);
      transactionForm.resetFields();
    } catch (error) {
      message.error(`Failed to ${transactionType}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (customer: Customer) => {
    Modal.confirm({
      title: 'Delete Customer Account',
      content: `Are you sure you want to delete ${customer.fullName}'s account? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        setLoading(true);
        try {
          await customerService.deleteCustomer(customer.id);
          setCustomers(customers.filter(c => c.id !== customer.id));
          message.success('Customer account deleted successfully!');
        } catch (error) {
          message.error('Failed to delete customer');
          console.error(error);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const columns = [
    {
      title: 'Customer ID',
      dataIndex: 'id',
      key: 'id',
      width: 150,
    },
    {
      title: 'Name',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: (a: Customer, b: Customer) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: 'Phone Number',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance: number) => `ETB ${balance.toFixed(2)}`,
      sorter: (a: Customer, b: Customer) => a.balance - b.balance,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'green';
        let label = status || 'ACTIVE';
        if (status === 'Frozen') {
          color = 'red';
          label = 'FROZEN';
        } else if (status === 'Inactive') {
          color = 'gray';
          label = 'INACTIVE';
        } else {
          label = 'ACTIVE';
        }
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Customer) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Edit
          </Button>
          <Button
            type="primary"
            className="bg-green-600 hover:bg-green-700"
            icon={<DollarOutlined />}
            onClick={() => {
              setSelectedCustomer(record);
              setTransactionType('deposit');
              setTransactionModalVisible(true);
            }}
            size="small"
          >
            Deposit
          </Button>
          <Button
            type="primary"
            className="bg-orange-500 hover:bg-orange-600 border-none"
            icon={<DollarOutlined />}
            onClick={() => {
              setSelectedCustomer(record);
              setTransactionType('withdraw');
              setTransactionModalVisible(true);
            }}
            size="small"
          >
            Withdraw
          </Button>
          {record.status === 'Frozen' ? (
            <Button
              type="default"
              className="bg-blue-500 text-white hover:bg-blue-600"
              onClick={() => handleStatusChange(record.id, 'Active')}
              size="small"
            >
              Unfreeze
            </Button>
          ) : (
            <Button
              type="default"
              danger
              onClick={() => handleStatusChange(record.id, 'Frozen')}
              size="small"
            >
              Freeze
            </Button>
          )}
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            size="small"
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const handleStatusChange = async (id: number, newStatus: string) => {
    setLoading(true);
    try {
      await bankerAPI.updateStatus(id, newStatus);
      const updatedCustomers = customers.map(c =>
        c.id === id ? { ...c, status: newStatus } : c
      );
      setCustomers(updatedCustomers);
      message.success(`Account ${newStatus === 'Frozen' ? 'frozen' : 'activated'} successfully`);
    } catch (error) {
      console.error(error);
      message.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          className="mb-6"
          size="large"
        >
          Back to Home
        </Button>

        <Card className="shadow-xl mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <img src={abayLogo} alt="Abay Bank Logo" className="w-12 h-12 rounded-full mr-4 border border-gray-200 shadow-sm" />
                <h1 className="text-3xl font-bold text-gray-800">Banker Portal</h1>
              </div>
              <p className="text-gray-600">SOURCE OF GREATNESS - Manage customer accounts and view all transactions</p>
            </div>
            <Button
              type="primary"
              size="large"
              className="bg-green-600 hover:bg-green-700 h-12 px-8 rounded-xl font-bold"
              onClick={() => setIsCreateModalVisible(true)}
            >
              Add New Customer
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-3">
            <Card title={<span><LineChartOutlined /> Daily Transaction Volume (Last 7 Days)</span>} className="shadow-lg h-full">
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <AreaChart data={dailyStats}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1890ff" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#1890ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#8c8c8c', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#8c8c8c', fontSize: 12 }}
                      tickFormatter={(value) => `ETB ${value}`}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(value: any) => [`ETB ${value.toLocaleString()}`, 'Total Volume']}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalAmount"
                      stroke="#1890ff"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorAmount)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          <div className="flex flex-col gap-6">
            <Card className="shadow-lg border-l-4 border-blue-500 flex-1">
              <Statistic
                title="Active Customers"
                value={activeCustomers}
                prefix={<BankOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
            <Card className="shadow-lg border-l-4 border-red-500 flex-1">
              <Statistic
                title="Frozen Accounts"
                value={frozenCustomers}
                prefix={<DeleteOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="shadow-lg">
            <Statistic
              title="Total Bank Balance"
              value={totalBalance}
              precision={2}
              prefix="ETB"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
          <Card className="shadow-lg">
            <Statistic
              title="Average Balance"
              value={customers.length > 0 ? totalBalance / customers.length : 0}
              precision={2}
              prefix="ETB"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </div>

        <Card title="All Customers" className="shadow-lg">
          {customers.length === 0 ? (
            <div className="text-center py-12">
              <DollarOutlined className="text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No customers yet</p>
              <p className="text-gray-400">Customers will appear here once they create accounts</p>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={customers}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 'max-content' }}
            />
          )}
        </Card>

        <Modal
          title="Edit Customer Information"
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingCustomer(null);
            form.resetFields();
          }}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdate}
          >
            <Form.Item
              label="Full Name"
              name="name"
              rules={[{ required: true, message: 'Please enter customer name' }]}
            >
              <Input size="large" placeholder="Enter customer name" />
            </Form.Item>

            <Form.Item
              label="Phone Number"
              name="phone"
              rules={[
                { required: true, message: 'Please enter phone number' },
                { pattern: /^[0-9]{10,}$/, message: 'Please enter a valid phone number' }
              ]}
            >
              <Input size="large" placeholder="Enter phone number" />
            </Form.Item>

            <Form.Item>
              <Space className="w-full justify-end">
                <Button
                  onClick={() => {
                    setIsModalVisible(false);
                    setEditingCustomer(null);
                    form.resetFields();
                  }}
                >
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" className="bg-blue-600 hover:bg-blue-700" loading={loading}>
                  Update Customer
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Create New Customer Account"
          open={isCreateModalVisible}
          onCancel={() => {
            setIsCreateModalVisible(false);
            createForm.resetFields();
          }}
          footer={null}
        >
          <Form
            form={createForm}
            layout="vertical"
            onFinish={handleCreate}
          >
            <Form.Item
              label="Full Name"
              name="name"
              rules={[{ required: true, message: 'Please enter customer name' }]}
            >
              <Input size="large" placeholder="Enter customer name" />
            </Form.Item>

            <Form.Item
              label="Phone Number"
              name="phone"
              rules={[
                { required: true, message: 'Please enter phone number' },
                { pattern: /^[0-9]{10,}$/, message: 'Please enter a valid phone number' }
              ]}
            >
              <Input size="large" placeholder="Enter phone number" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please set a password' }]}
            >
              <Input.Password size="large" placeholder="Set customer password" />
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
                prefix="ETB"
                min={0}
              />
            </Form.Item>

            <Form.Item>
              <Space className="w-full justify-end">
                <Button onClick={() => setIsCreateModalVisible(false)}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" className="bg-green-600 hover:bg-green-700" loading={loading}>
                  Create Account
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={transactionType === 'deposit' ? 'Deposit Money' : 'Withdraw Money'}
          open={transactionModalVisible}
          onCancel={() => {
            setTransactionModalVisible(false);
            setSelectedCustomer(null);
            transactionForm.resetFields();
          }}
          footer={null}
        >
          {selectedCustomer && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="mb-1 text-gray-600">Customer: <strong>{selectedCustomer.fullName}</strong></p>
              <p className="text-gray-600">Current Balance: <strong>ETB {selectedCustomer.balance.toFixed(2)}</strong></p>
            </div>
          )}
          <Form
            form={transactionForm}
            layout="vertical"
            onFinish={handleTransaction}
          >
            <Form.Item
              label="Amount"
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
              <Space className="w-full justify-end">
                <Button onClick={() => setTransactionModalVisible(false)}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  className={transactionType === 'deposit' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600 border-none'}
                  loading={loading}
                >
                  Confirm {transactionType === 'deposit' ? 'Deposit' : 'Withdraw'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}

export default BankerDashboard;
