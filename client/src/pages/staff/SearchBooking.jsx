import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import StatCard from '../../components/dashboard/StatCard';
import BookingGrid from '../../components/booking/BookingGrid';
import SearchBar from '../../components/booking/SearchBar';
import '../../styles/AfterLife-Theme.css';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function SearchBooking() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchInput, setSearchInput] = useState('');
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState('current');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('query');
    const tab = params.get('tab') || 'current';



    if (query) {
      setSearchInput(query);
      setActiveTab(tab);
      setIsLoading(true);
      setHasSearched(true);

      axios.get(`/api/booking/search?query=${encodeURIComponent(query)}`, { withCredentials: true })
        .then((res) => {
          setBookings(res.data);
        })
        .catch((err) => {
          //console.error("Search failed:", err);
          setBookings([]);
          toast.error('Failed to search bookings — please try again.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [location.search]);

  const isValidInput = (input) => {
    const phoneRegex = /^\d{8}$/; // Adjust to match local phone number format
    return phoneRegex.test(input.trim());
  };
  
  const handleSearch = () => {
    if (!isValidInput(searchInput)) {
      toast.error('Please enter a valid 8-digit contact number.');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    navigate(`/search-booking?query=${encodeURIComponent(searchInput)}&tab=${activeTab}`);

    axios.get(`/api/booking/search?query=${encodeURIComponent(searchInput)}`)
      .then((res) => setBookings(res.data))
      .catch(() => {
        setBookings([]);
        toast.error('Failed to search bookings — please try again.');
      })
      .finally(() => setIsLoading(false));
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleApprovePlacement = async (bookingID) => {
    const booking = bookings.find(b => b.id === bookingID);
    if (!booking) return;

    try {
      await axios.post("/api/booking/approve", {
        bookingID: bookingID,
        nicheID: booking.nicheID
      }, { withCredentials: true });

      // for immediate visual changes
      setBookings(prev =>
        prev.map(b =>
          b.id === bookingID
            ? { ...b, bookingType: 'Current', nicheStatus: 'Occupied' }
            : b
        )
      );

      toast.success('Booking approved successfully!');
    } catch (err) {
      //console.error("Failed to approve placement:", err);
      toast.error('Failed to approve booking — please try again.');
    }
  };

  const handleArchiveBooking = async (bookingID) => {
    const booking = bookings.find(b => b.id === bookingID);
    if (!booking) return;

    try {
      await axios.post("/api/booking/archive", {
        bookingID: bookingID,
        nicheID: booking.nicheID
      }, { withCredentials: true });

      // for immediate visual changes
      setBookings(prev =>
        prev.map(b =>
          b.id === bookingID
            ? { ...b, bookingType: 'Archived', nicheStatus: 'Available' }
            : b
        )
      );

      toast.success('Booking archived successfully!');
    } catch (err) {
      //console.error("Archiving failed:", err);
      toast.error('Failed to archive booking — please try again.');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (searchInput.trim()) {
      navigate(`/search-booking?query=${encodeURIComponent(searchInput)}&tab=${tab}`);
    }
  };


  const currentBookings = bookings.filter(b => b.bookingType === 'Current');
  const preorderBookings = bookings.filter(b => b.bookingType === 'PreOrder');
  const archivedBookings = bookings.filter(b => b.bookingType === 'Archived');
  const pendingCount = bookings.filter(b => b.nicheStatus === 'Pending').length;

  return (
    <div className="search-booking">
      <h1 className="title">Bookings Search</h1>
      <p className="subtitle">Search for user bookings by contact number</p>

      <SearchBar
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyPress={handleKeyPress}
        onSearch={handleSearch}
        isLoading={isLoading}
      />

      {hasSearched && bookings.length > 0 && !isLoading && (
        <div className="stats-container">
          <StatCard label="Total Bookings" value={bookings.length.toString()} />
          <StatCard label="Pending Bookings" value={pendingCount.toString()} color="text-danger" />
        </div>
      )}

      {isLoading && (
        <div className="loading">Searching for bookings...</div>
      )}

      {hasSearched && !isLoading && bookings.length === 0 && (
        <div className="no-results">No bookings found for this user.</div>
      )}

      {hasSearched && bookings.length > 0 && !isLoading && (
        <>
          <div className="tabs">
            <span
              className={activeTab === 'current' ? 'active' : ''}
              onClick={() => handleTabChange('current')}
            >
              Current
            </span>
            <span
              className={activeTab === 'preorder' ? 'active' : ''}
              onClick={() => handleTabChange('preorder')}
            >
              Preorder
            </span>
            <span
              className={activeTab === 'archived' ? 'active' : ''}
              onClick={() => handleTabChange('archived')}
            >
              Archived
            </span>

          </div>
          <div className="booking-section">
            {activeTab === 'current' && (
              <BookingGrid
                title="Current Bookings"
                bookings={currentBookings}
                currentTab={activeTab}
                onArchive={handleArchiveBooking}
              />
            )}
            {activeTab === 'preorder' && (
              <BookingGrid
                title="Preorder Bookings"
                bookings={preorderBookings}
                onApprove={handleApprovePlacement}
                currentTab={activeTab}
              />
            )}
            {activeTab === 'archived' && (
              <BookingGrid
                title="Archived Bookings"
                bookings={archivedBookings}
                currentTab={activeTab}
              />
            )}
          </div>
        </>
      )}

    </div>
  );
}