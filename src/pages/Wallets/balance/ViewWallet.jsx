import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import TopBar from '../../../components/topBar';
import Sidebar from '../../../components/sideBar';
import { CreditCard, Calendar, DollarSign, User, Hash, FileText, Package, Clock, AlertCircle } from 'lucide-react';

export default function ViewWallet() {
  const { id } = useParams();
  const location = useLocation();
  const walletData = location.state?.walletData;

  const formatAmount = (amount) => {
    return Math.abs(amount).toLocaleString();
  };

  if (!walletData) {
    return (
      <div className="flex py-5 pr-10 pl-5 pb-20">
        <Sidebar isMobile={false} />
        <div className="content flex-1">
          <TopBar />
          <div className="text-center p-4">
            No wallet data available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex py-5 pr-10 pl-5 pb-20">
      <Sidebar isMobile={false} />
      <div className="content flex-1">
        <TopBar />
        
        <div className="col-span-12 lg:col-span-12 xl:col-span-8 mt-2">
          <div className="intro-y block sm:flex items-center h-10">
            <h2 className="text-lg font-medium truncate mt-3 mr-5">Wallet Details</h2>
          </div>
          
          <div className="report-box-2 intro-y mt-12 sm:mt-5">
            <div className="box sm:flex">
              <div className="px-8 py-12 flex flex-col justify-center flex-1">
                <CreditCard className="w-10 h-10 text-primary" />
                <div className="relative text-3xl font-medium mt-10">
                  {formatAmount(walletData.amount)}
                  <span className="text-2xl font-medium ml-12">IQD</span>
                </div>
                <div className="mt-4 text-slate-500 mb-8">
                  Transaction {walletData.amount > 0 ? 'Credit' : 'Debit'}
                </div>
                <div className={`btn ${walletData.state === 'completed' ? 'bg-success text-white' : 'bg-warning text-white'}`}>
                  <AlertCircle className="text-xl mr-1" /> {walletData.state}
                </div>
              </div>
              
              <div className="px-8 py-12 flex flex-col justify-center flex-1 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-darkmode-300 border-dashed">
                <div className="text-slate-500 text-xs">TITLE</div>
                <div className="mt-1.5 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  <div className="text-base">{walletData.name}</div>
                </div>
                
                <div className="text-slate-500 text-xs mt-5">TYPE</div>
                <div className="mt-1.5 flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  <div className="text-base">{walletData.type}</div>
                </div>
                
                <div className="text-slate-500 text-xs mt-5">DATE AND TIME</div>
                <div className="mt-1.5 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <div className="text-base">{new Date(walletData.create_date).toLocaleString()}</div>
                </div>

                <div className="text-slate-500 text-xs mt-5">REFERENCE</div>
                <div className="mt-1.5 flex items-center">
                  <Hash className="w-4 h-4 mr-2" />
                  <div className="text-base">{walletData.shared_ref}</div>
                </div>
                
                
              </div>
            </div>
          </div>
          
          {walletData.journals?.[0] && (
            <div className="report-box-2 intro-y mt-5">
              <div className="box p-5">
                <h3 className="text-lg font-medium mb-3">Journal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center mb-3">
                      <User className="w-4 h-4 mr-2" />
                      <span className="text-slate-500">Partner:</span>
                      <span className="ml-2">{walletData.journals[0].partner_id[1]}</span>
                    </div>
                    <div className="flex items-center mb-3">
                      <Hash className="w-4 h-4 mr-2" />
                      <span className="text-slate-500">Journal ID:</span>
                      <span className="ml-2">{walletData.journals[0].id}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center mb-3">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-slate-500">Created:</span>
                      <span className="ml-2">{new Date(walletData.journals[0].create_date).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center mb-3">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span className="text-slate-500">Amount:</span>
                      <span className="ml-2">{formatAmount(walletData.journals[0].amount)} IQD</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}