import React, { useEffect, useState } from 'react';
import { db } from '@/service/Firebaseconfig';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import Info from './components/Info';
import Hotels from './components/Hotels';
import Itinerary from './components/Itinerary';
import Footer from './components/Footer';
import html2pdf from 'html2pdf.js'; // Ensure this is the correct import




function Viewtrip() {
  const { tripId } = useParams(); // Extract tripId from URL params
  const [trip, setTrip] = useState(null); // Initial state is null
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    if (tripId && !trip) { // Fetch trip data only if tripId exists and data isn't already fetched
      console.log("Trip ID from URL:", tripId); // Log tripId to ensure it's correct
      GetTripData();
    }
  }, [tripId, trip]);
 

  

  // Convert itinerary object to an array
  const convertItineraryToArray = (itinerary) => {
    if (!itinerary) return [];
    return Object.entries(itinerary).map(([day, details]) => ({
      day,
      ...details,
      dayPlan: details.dayPlan?.map(plan => ({
        placeName: plan.placeName || plan.PlaceName || "Unknown Place",
        placeDetails: plan.placeDetails || plan.PlaceDetails || "No details available",
        ticketPricing: plan.ticketPricing || "Free",
        timeToTravel: plan.timeToTravel || "Flexible timing",
      })) || [],
    }));
  };

  // Convert hotel options to an array
  const convertHotelsToArray = (hotelOptions) => {
    if (!hotelOptions) return [];
    return hotelOptions.map((hotel) => ({
      hotelName: hotel.hotelName || "Unknown Hotel",
      hotelAddress: hotel.hotelAddress || "Address not available",
      hotelImageUrl: hotel.hotelImageUrl || "fallback-image-url.jpg",
      description: hotel.description || "No description available",
      geoCoordinates: hotel.geoCoordinates || "Coordinates not available",
      price: hotel.price || "Price not specified",
      rating: hotel.rating || "Rating not available",
    }));
  };
  
  const GetTripData = async () => {
    setLoading(true); // Set loading state to true before fetching
    console.log("Fetching trip data for ID:", tripId); // Log to see if this runs
    try {
      const docRef = doc(db, "AITrips", tripId); // Use the correct collection and tripId
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const tripData = docSnap.data();
        console.log("Document data before transformation:", tripData); // Log the data before transformation

        // Normalize itinerary and hotels
        const normalizedTripData = {
          ...tripData,
          tripData: {
            ...tripData.tripData,
            itinerary: convertItineraryToArray(tripData.tripData?.itinerary),
            hotel_options: convertHotelsToArray(tripData.tripData?.hotel_options),
          },
        };

        console.log("Normalized trip data:", normalizedTripData); // Log transformed data
        setTrip(normalizedTripData); // Set the trip data with normalized itinerary and hotels
      } else {
        console.log("No such document exists!!");
        setError('No such trip found');
        toast('No such Trip Found');
      }
    } catch (error) {
      console.error("Error fetching document:", error); // Log any errors
      setError('Error fetching trip data');
      toast('Error fetching trip data');
    } finally {
      setLoading(false); // Set loading state to false once the request completes
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Display loading message
  }

  if (error) {
    return <div>{error}</div>; // Display error message
  }
  const handleDownload = () => {
    window.print();
  };

  return (

<div className="relative">
      {/* Button to download PDF */}
      <button
      onClick={handleDownload}
        className="absolute top-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-md hover:bg-blue-600"
      >
        Download PDF
      </button>
    
    <div className="pd-10 md:px-20 lg:px-44 xl:px-56">
      {/** Information Section */}
      <Info trip={trip} />
      {/** Recommended Hotels */}
      <Hotels trip={trip} />
      {/** Itinerary Section */}
       <Itinerary trip={trip} />
      {/** Footer */}
      <Footer />
    </div>
    </div>
  );
}

export default Viewtrip;
