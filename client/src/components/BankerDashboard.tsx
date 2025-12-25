import { useEffect, useState } from 'react';
import { Button, Card, Form, Input, message, Modal, Space, Statistic, Table } from 'antd';
import { ArrowLeftOutlined, BankOutlined, DeleteOutlined, EditOutlined, DollarOutlined } from '@ant-design/icons';
import { customerService } from '../services/customerService';
import { Customer } from '../types/customer';

interface BankerDashboardProps {
  onBack: () => void;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

function BankerDashboard({ onBack, customers, setCustomers }: BankerDashboardProps) {
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCustomers();
  }, []);

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
      render: (balance: number) => `$${balance.toFixed(2)}`,
      sorter: (a: Customer, b: Customer) => a.balance - b.balance,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: Customer, b: Customer) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
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
                <BankOutlined className="text-3xl text-blue-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-800">Banker Portal</h1>
              </div>
              <p className="text-gray-600">Manage customer accounts and view all transactions</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="shadow-lg">
            <Statistic
              title="Total Customers"
              value={customers.length}
              prefix={<BankOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
          <Card className="shadow-lg">
            <Statistic
              title="Total Bank Balance"
              value={totalBalance}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
          <Card className="shadow-lg">
            <Statistic
              title="Average Balance"
              value={customers.length > 0 ? totalBalance / customers.length : 0}
              precision={2}
              prefix="$"
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
      </div>
    </div>
  );
}

export default BankerDashboard;
