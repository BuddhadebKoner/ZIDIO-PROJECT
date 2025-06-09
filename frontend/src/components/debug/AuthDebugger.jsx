import { useAuth } from '@clerk/clerk-react';
import { useState } from 'react';

const AuthDebugger = () => {
  const { getToken, isLoaded, user } = useAuth();
  const [token, setToken] = useState(null);
  const [testResult, setTestResult] = useState(null);

  const handleGetToken = async () => {
    try {
      const clerkToken = await getToken();
      setToken(clerkToken);
      console.log('Token:', clerkToken);
    } catch (error) {
      console.error('Error getting token:', error);
      setToken('Error getting token');
    }
  };

  const testAuthEndpoint = async () => {
    try {
      const clerkToken = await getToken();
      const response = await fetch(`${import.meta.env.VITE_SERVER_HOST}/auth/is-authenticated`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${clerkToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setTestResult({
        status: response.status,
        data: data,
        success: response.ok
      });
    } catch (error) {
      setTestResult({
        status: 'Error',
        data: error.message,
        success: false
      });
    }
  };

  if (!isLoaded) {
    return <div>Loading Clerk...</div>;
  }

  return (
    <div className="p-6 bg-gray-100 rounded-lg max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Clerk Authentication Debugger</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold">User Status:</h3>
        <p>Clerk Loaded: {isLoaded ? 'Yes' : 'No'}</p>
        <p>User Authenticated: {user ? 'Yes' : 'No'}</p>
        {user && (
          <div>
            <p>User ID: {user.id}</p>
            <p>Email: {user.primaryEmailAddress?.emailAddress}</p>
          </div>
        )}
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold">Environment:</h3>
        <p>Server Host: {import.meta.env.VITE_SERVER_HOST}</p>
        <p>Clerk Publishable Key: {import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.substring(0, 20)}...</p>
      </div>

      <div className="mb-4">
        <button 
          onClick={handleGetToken}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Get Token
        </button>
        <button 
          onClick={testAuthEndpoint}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Test Auth Endpoint
        </button>
      </div>

      {token && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Token:</h3>
          <p className="break-all text-sm bg-gray-200 p-2 rounded">
            {token.substring(0, 100)}...
          </p>
        </div>
      )}

      {testResult && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Test Result:</h3>
          <div className={`p-2 rounded ${testResult.success ? 'bg-green-200' : 'bg-red-200'}`}>
            <p>Status: {testResult.status}</p>
            <p>Success: {testResult.success ? 'Yes' : 'No'}</p>
            <pre className="text-sm mt-2">{JSON.stringify(testResult.data, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthDebugger;
