import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TableQrCenter from '../components/TableQrCenter';

const QrCenter = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar title="Table QR Studio" />
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          <TableQrCenter />
        </main>
      </div>
    </div>
  );
};

export default QrCenter;
