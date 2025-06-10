import { Link } from 'react-router-dom';
import '../App.css';

function HomePage() {
  return (
    <div className="container flex items-center justify-center min-h-screen">
      <div className="card w-full max-w-2xl">
        <h1 className="text-center mb-lg">Teleradiology Portal</h1>
        <div className="grid grid-cols-2 gap-lg">
          <Link to="/patient" className="card hover:shadow-lg transition-shadow p-lg text-center">
            <h2 className="mb-md">Patient Portal</h2>
            <p className="text-muted-foreground mb-md">
              Access your medical records and upload MRI scans
            </p>
            <button className="btn w-full">Enter Patient Portal</button>
          </Link>
          
          <Link to="/doctor" className="card hover:shadow-lg transition-shadow p-lg text-center">
            <h2 className="mb-md">Doctor Portal</h2>
            <p className="text-muted-foreground mb-md">
              Review patient scans and provide medical analysis
            </p>
            <button className="btn btn-secondary w-full">Enter Doctor Portal</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
