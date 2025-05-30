import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavBar';


export default function Dashboard() {
    return (
      <div className="d-flex">
        <Sidebar />
        <div className="flex-grow-1">
          <TopNavbar />
          <div className="p-4">
            {/* Page Content */}
            <h1>Dashboard Content</h1>
          </div>
        </div>
      </div>
    );
  }