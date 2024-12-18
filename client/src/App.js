import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux'; // Import Provider
import { TransitionGroup, CSSTransition } from 'react-transition-group'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MoviesPage from './pages/MoviesPage';
import TVSeriesPage from './pages/TVSeriesPage';
import WhatToWatchPage from './pages/WhatToWatchPage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import ProfilePage from './pages/ProfilePage';
import Home from './pages/Home';
import SearchResults from './components/SearchResults';

import './styles/App.css';
import './styles/Notification.css';
import store from './store/store';

const App = () => {
  const location = useLocation();
  const [searchResults, setSearchResults] = useState([]); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); // User is logged in if token exists
  }, []);

  return (
    <Provider store={store}> {/* Wrap App in Redux Provider */}
      <div className="App">
        {/* Navbar with login status and search functionality */}
        <Navbar 
          setIsLoggedIn={setIsLoggedIn} 
          isLoggedIn={isLoggedIn} 
          setSearchResults={setSearchResults} 
          searchResults={searchResults}
        />
        
        {/* Display search results if available */}
        {searchResults.length > 0 && <SearchResults results={searchResults} />}

        {/* Page transition wrapper */}
        <TransitionGroup component={null}>
          <CSSTransition 
            key={location.key}
            classNames="page-transition"
            timeout={500}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/movies" element={<MoviesPage />} />
              <Route path="/tv-series" element={<TVSeriesPage />} />
              <Route path="/what-to-watch" element={<WhatToWatchPage />} />
              <Route path="/movies/:id" element={<MovieDetailsPage isTVShow={false} />} />
              <Route path="/tv-series/:id" element={<MovieDetailsPage isTVShow={true} />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </CSSTransition>
        </TransitionGroup>

        {/* Footer and toast notifications */}
        <Footer />
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          hideProgressBar 
          newestOnTop 
          closeOnClick 
          rtl={false} 
          pauseOnFocusLoss 
          draggable 
          pauseOnHover 
        />
      </div>
    </Provider>
  );
};

export default App;
