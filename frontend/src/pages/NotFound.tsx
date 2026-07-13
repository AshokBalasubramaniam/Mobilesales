import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import Button from '../components/common/Button';
import { PATHS } from '../routes/paths';

const NotFound = () => (
  <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 text-center">
    <SearchX className="size-12 text-gray-400" />
    <h1 className="text-2xl font-bold">Page not found</h1>
    <p className="text-sm text-gray-500">The page you're looking for doesn't exist or has been moved.</p>
    <Link to={PATHS.home}>
      <Button className="mt-2">Go to homepage</Button>
    </Link>
  </div>
);

export default NotFound;
