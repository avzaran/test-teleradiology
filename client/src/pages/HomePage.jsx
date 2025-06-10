import { Link } from 'react-router-dom';
import '../App.css';

function HomePage() {
  return (
    <div className="container">
      <h1>Teleradiology Portal</h1>
      <nav>
        <Link to="/patient">Patient Portal</Link>
        <Link to="/doctor">Doctor Portal</Link>
      </nav>
    </div>
  );
}

export default HomePage;
