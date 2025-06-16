import React, { useState } from 'react';
import StatCard from '../../components/staffDashboard/StatCard';
import BookingGrid from '../../components/booking/BookingGrid';
import SearchBar from '../../components/booking/SearchBar';
import '../../styles/SearchBooking.css';
import axios from 'axios';

export default function SearchBooking() {
  const [searchInput, setSearchInput] = useState('');
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState('current');

  const handleSearch = () => {
    if (!searchInput.trim()) return;
    setIsLoading(true);
    setHasSearched(true);

    axios.get(`http://localhost:8888/api/booking/search?query=${encodeURIComponent(searchInput)}`)
      .then((res) => {
        console.log(res.data);
        setBookings(res.data);
      })
      .catch((err) => {
        console.error("Search failed:", err);
        setBookings([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleApprovePlacement = async (bookingID) => {
    const booking = bookings.find(b => b.id === bookingID);
    if (!booking) return;

    try {
      await axios.post("http://localhost:8888/api/booking/approve", {
        bookingID: bookingID,
        nicheID: booking.nicheID
      });

      // for immediate visual changes
      setBookings(prev =>
        prev.map(b =>
          b.id === bookingID
            ? { ...b, bookingType: 'Current', nicheStatus: 'Occupied' }
            : b
        )
      );
    } catch (err) {
      console.error("Failed to approve placement:", err);
    }
  };


  const handleDeclineBooking = (id) => {
    /*setBookings(prev =>
      prev.map(b => b.id === id ? { ...b, status: 'declined' } : b)
    );*/
  };

  const handleArchiveBooking = async (bookingID) => {
    const booking = bookings.find(b => b.id === bookingID);
    if (!booking) return;
  
    try {
      await axios.post("http://localhost:8888/api/booking/archive", {
        bookingID: bookingID,
        nicheID: booking.nicheID
      });
  
      // for immediate visual changes
      setBookings(prev =>
        prev.map(b =>
          b.id === bookingID
            ? { ...b, bookingType: 'Archived', nicheStatus: 'Available' }
            : b
        )
      );
    } catch (err) {
      console.error("Archiving failed:", err);
    }
  };
  
  const currentBookings = bookings.filter(b => b.bookingType === 'Current');
  const preorderBookings = bookings.filter(b => b.bookingType === 'PreOrder');
  const archivedBookings = bookings.filter(b => b.bookingType === 'Archived');
  const pendingCount = bookings.filter(b => b.nicheStatus === 'Pending').length;

  return (
    <div className="search-booking">
      <h1 className="title">Bookings LookUp</h1>
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
            <span className={activeTab === 'current' ? 'active' : ''} onClick={() => setActiveTab('current')}>Current</span>
            <span className={activeTab === 'preorder' ? 'active' : ''} onClick={() => setActiveTab('preorder')}>Preorder</span>
            <span className={activeTab === 'archived' ? 'active' : ''} onClick={() => setActiveTab('archived')}>Archived</span>
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
                onDecline={handleDeclineBooking}
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