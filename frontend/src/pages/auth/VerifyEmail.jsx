import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import { authApi } from '../../api/auth.api';
import Spinner from '../../components/common/Spinner';
import { PATHS } from '../../routes/paths';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!token) return setStatus('error');
    authApi
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  if (status === 'loading') return <Spinner full />;

  return (
    <div className="text-center">
      {status === 'success' ? (
        <>
          <CheckCircle2 className="mx-auto mb-3 size-12 text-green-500" />
          <h1 className="text-xl font-bold">Email verified!</h1>
          <p className="mt-1 text-sm text-gray-500">Your email has been verified successfully.</p>
        </>
      ) : (
        <>
          <XCircle className="mx-auto mb-3 size-12 text-red-500" />
          <h1 className="text-xl font-bold">Verification failed</h1>
          <p className="mt-1 text-sm text-gray-500">This link is invalid or has expired.</p>
        </>
      )}
      <Link to={PATHS.home} className="mt-6 inline-block text-sm font-medium text-brand-600 hover:underline">
        Go to homepage
      </Link>
    </div>
  );
};

export default VerifyEmail;
