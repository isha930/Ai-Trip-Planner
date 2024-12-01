import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { MdDelete } from "react-icons/md";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from '@/service/Firebaseconfig';
import { useNavigate } from "react-router-dom";

function UserTripCardItem({ trip, onDelete }) {
  const [placeImageUrl, setPlaceImageUrl] = useState('');
  
  // Function to fetch the image for the trip's location
  const fetchPlaceImage = async () => {
    try {
      const placeName = trip?.userSelection?.location?.place_name;
      if (placeName) {
        // Replace YOUR_BING_SEARCH_API_KEY with your actual API key
        const response = await axios.get(`https://api.bing.microsoft.com/v7.0/images/search`, {
          headers: {
            'Ocp-Apim-Subscription-Key': import.meta.env.VITE_BING_SEARCH_API_KEY, // Make sure you have this in your .env file
          },
          params: {
            q: placeName,
            count: 1,
          },
        });

        const imageUrl = response.data.value[0]?.contentUrl;
        if (imageUrl) {
          setPlaceImageUrl(imageUrl);
        }
      }
    } catch (error) {
      console.error("Error fetching place image:", error);
      toast.error("Failed to fetch place image.");
    }
  };

  // Fetch the place image when the component mounts
  useEffect(() => {
    fetchPlaceImage();
  }, [trip]);

  const handleDelete = async () => {
    try {
      const tripId = trip.id; 
      console.log("Trip ID to delete:", tripId); // Verify trip ID
      
      // Delete the document from Firestore
      await deleteDoc(doc(db, "AITrips", tripId));

      // Optionally, you can remove the trip from local storage
      const trips = JSON.parse(localStorage.getItem('trips')) || [];
      const updatedTrips = trips.filter(t => t.id !== tripId);
      localStorage.setItem('trips', JSON.stringify(updatedTrips));

      toast.success("Trip deleted successfully!");
      onDelete(tripId); // Call the onDelete function passed from the parent
    } catch (error) {
      console.error("Error deleting trip:", error.response ? error.response.data : error.message);
      toast.error("Failed to delete trip.");
    }
  };
  const navigate = useNavigate();

  const handleViewTrip = () => {
    navigate(`/view-trip/${trip?.id}`); // Navigate to the trip's itinerary page
  };

  return (
    <div className="max-w-sm bg-white shadow-lg rounded-xl overflow-hidden">
      {/* Trip Image */}
      <img
        src={placeImageUrl || '/landscape.jpg'} // Use the fetched image or a default
        alt="Trip Destination"
        className="w-full h-48 object-cover"
      />

      {/* Location */}
      <div className="p-4">
        <h2 className="text-2xl font-semibold mb-2">
          🏙 {trip?.userSelection?.location?.place_name || 'Unknown Location'}
        </h2>

        {/* Travel Details */}
        <p className="text-gray-600 text-sm mb-2">
          📅 <span className="font-medium">No. of Days:</span> {trip?.userSelection?.noOfDays || 'Not specified'}
        </p>
        <p className="text-gray-600 text-sm mb-2">
          <span className="font-medium">Travellers:</span> {trip?.userSelection?.travellers || 'Not specified'}
        </p>
        <p className="text-gray-600 text-sm mb-2">
          <span className="font-medium">Budget:</span> {trip?.userSelection?.budget || 'Not specified'}
        </p>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={handleViewTrip}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            View Trip
          </button>

          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700"
          >
            <MdDelete className="inline-block mr-1" /> Delete Trip
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserTripCardItem;
