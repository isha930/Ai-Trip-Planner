import { collection, getDocs, query, where } from 'firebase/firestore';
import { useNavigation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { db } from '@/service/Firebaseconfig';
import UserTripCardItem from './Components/UserTripCardItem';


function MyTrips() {
  const Navigate = useNavigation();
  const [userTrips, setUserTrips] = useState([]);

  // Fetch the user's trips on component mount
  useEffect(() => {
    GetUserTrip();
  }, []);

  const GetUserTrip = async () => {
    const user = JSON.parse(localStorage.getItem('user'));


    if (!user.email) {
      Navigate('/');
      return;
    }

    console.log("Fetching trips for user:", user.email);
    setUserTrips([]); // Clear previous data
    const q = query(collection(db, 'AITrips'), where('userEmail', '==', user?.email));
    const querySnapshot = await getDocs(q);

    const trips = [];
    querySnapshot.forEach((doc) => {
      const tripData = { id: doc.id, ...doc.data() }; // Include the document ID

      trips.push(tripData); // Collect trip data
    });

    setUserTrips(trips); // Update the state with all trips
  };

  const handleDeleteTrip = (tripId) => {
    // Filter out the deleted trip from the state
    setUserTrips((prevTrips) => prevTrips.filter(trip => trip.id !== tripId));
  };

  return (
    <div className='sm:px-10 md:px-32 lg:px-56 mt-4 xl:px-10 px-5'>
      <h2 className='font-bold text-3xl'>My Trips</h2>

      <div className='grid grid-cols-2 mt-6 md:grid-cols-3 gap-5'>
        {userTrips.map((trip) => (
          <UserTripCardItem key={trip.id} trip={trip} onDelete={handleDeleteTrip} />
        ))}
      </div>
    </div>
  );
}

export default MyTrips;
