import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useEffect, useState } from 'react';
import NotificationDropdown from '../common/NotificationDropdown';
import { connectAdminSocket, getAdminSocket } from '../../util/adminSocket';

const Layout = () => {
  const adminInfo = useSelector((state: RootState) => state.adminAuth.adminInfo);
  const [socketReady, setSocketReady] = useState(false);

  useEffect(() => {
    if (adminInfo) {
      // @ts-ignore it seems adminInfo may have an id or _id depending on the slice
      // Looking at the slice, it has an `id` property
      const adminId = adminInfo.id || (adminInfo as any)._id;
      if (adminId) {
        connectAdminSocket(adminId);
        setSocketReady(true);
      }
    }
  }, [adminInfo]);

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-900">
        <div className="flex justify-end p-4 border-b border-gray-800">
          {adminInfo && socketReady && (
            <NotificationDropdown 
              userId={adminInfo.id || (adminInfo as any)._id} 
              userType="admin" 
              getSocket={getAdminSocket} 
            />
          )}
        </div>
        <div className="mx-auto max-w-7xl p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;