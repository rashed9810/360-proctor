import { useAuth } from '../hooks/useAuth';
import { useLocation } from 'react-router-dom';

const DebugInfo = () => {
  const { user, isAuthenticated, loading, error } = useAuth();
  const location = useLocation();

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🐛 Debug Info</h3>
      <div className="space-y-1">
        <div><strong>Path:</strong> {location.pathname}</div>
        <div><strong>Authenticated:</strong> {isAuthenticated ? '✅' : '❌'}</div>
        <div><strong>Loading:</strong> {loading ? '⏳' : '✅'}</div>
        <div><strong>User:</strong> {user ? user.email : 'None'}</div>
        <div><strong>Role:</strong> {user?.role || 'None'}</div>
        {error && <div><strong>Error:</strong> {error}</div>}
      </div>
    </div>
  );
};

export default DebugInfo;
