import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { MdDelete } from "react-icons/md";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from '@/service/Firebaseconfig';
import { useNavigate } from "react-router-dom";

function UserTripCardItem({ trip, onDelete }) {
  const [placeImageUrl, setPlaceImageUrl] = useState('/landscape.jpg'); // Set default image

  // Function to fetch the image for the trip's location
  const fetchPlaceImage = async () => {
    try {
      const placeName = trip?.userSelection?.location?.place_name;
      if (placeName) {
        const response = await axios.get(`https://api.pexels.com/v1/search`, {
          headers: {
            Authorization: import.meta.env.VITE_PEXELS_API_KEY, // Correct API Key
          },
          params: {
            query: placeName, // Use the placeName for the query
            per_page: 1, // Number of images to fetch
          },
        });

        if (response.data.photos.length > 0) {
          const imageUrl = response.data.photos[0].src.medium;
          setPlaceImageUrl(imageUrl);
        } else {
          setPlaceImageUrl('/landscape.jpg');
          console.log("No images found in pexels for ", placeName);
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
      await deleteDoc(doc(db, "aitp", tripId));

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
        src={placeImageUrl} // Use the fetched image or the default '/landscape.jpg'
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
