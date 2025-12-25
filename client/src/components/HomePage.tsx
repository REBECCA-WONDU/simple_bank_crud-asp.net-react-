import { Button, Card } from 'antd';
import { UserOutlined, BankOutlined } from '@ant-design/icons';
import buildingImg from '../assets/building.png';

interface HomePageProps {
  onSelectRole: (role: 'customer' | 'banker') => void;
}

function HomePage({ onSelectRole }: HomePageProps) {
  return (
    <div className="min-h-screen flex bg-gray-50 overflow-hidden">
      {/* Left Section: Hero Image */}
      <div
        className="hidden lg:flex lg:w-5/12 relative bg-cover bg-center shadow-2xl"
        style={{ backgroundImage: `url(${buildingImg})` }}
      >
        <div className="absolute inset-0 bg-blue-900/30 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 flex flex-col justify-end p-16 text-white z-10">
          <h2 className="text-4xl font-black tracking-widest uppercase mb-2">Abay Bank</h2>
          <p className="text-xl font-medium italic text-blue-100">SOURCE OF GREATNESS</p>
        </div>
      </div>

      {/* Right Section: Content */}
      <div className="w-full lg:w-7/12 flex flex-col items-center justify-center p-8 relative">
        <div className="max-w-2xl w-full animate-in fade-in slide-in-from-right-8 duration-1000">
          <div className="mb-12 text-center">
            <BankOutlined className="text-7xl text-blue-600 mb-6" />
            <h1 className="text-5xl font-black text-gray-900 mb-3 tracking-tight">Welcome</h1>
            <p className="text-gray-500 text-xl">Best-in-class banking service</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
            <Card
              hoverable
              className="flex-1 shadow-xl hover:shadow-2xl transition-all duration-300 border-t-4 border-green-500 rounded-2xl group"
              onClick={() => onSelectRole('customer')}
            >
              <div className="text-center py-6">
                <UserOutlined className="text-6xl text-green-500 mb-6 group-hover:scale-110 transition-transform" />
                <h2 className="text-2xl font-bold mb-3 text-gray-800">Customer</h2>
                <p className="text-gray-500 mb-8 leading-relaxed">
                  Access your personal account, manage deposits, and view balances.
                </p>
                <Button type="primary" size="large" className="bg-green-600 hover:bg-green-700 border-none px-10 h-12 text-lg font-bold rounded-xl w-full">
                  Access Portal
                </Button>
              </div>
            </Card>

            <Card
              hoverable
              className="flex-1 shadow-xl hover:shadow-2xl transition-all duration-300 border-t-4 border-blue-600 rounded-2xl group"
              onClick={() => onSelectRole('banker')}
            >
              <div className="text-center py-6">
                <BankOutlined className="text-6xl text-blue-600 mb-6 group-hover:scale-110 transition-transform" />
                <h2 className="text-2xl font-bold mb-3 text-gray-800">Banker</h2>
                <p className="text-gray-500 mb-8 leading-relaxed">
                  Comprehensive management tools for processing customer accounts.
                </p>
                <Button type="primary" size="large" className="bg-blue-600 hover:bg-blue-700 border-none px-10 h-12 text-lg font-bold rounded-xl w-full">
                  Access Portal
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
