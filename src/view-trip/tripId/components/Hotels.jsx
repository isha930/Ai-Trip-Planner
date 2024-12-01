import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { IoLocationSharp } from "react-icons/io5";

function Hotels({ trip }) {
  console.log("tripdata received in hotel",trip);
  if (!trip || !trip.tripData) {
    return <div>No hotel data available</div>;
  }

  const [hotelImages, setHotelImages] = useState({});

  const openInGoogleMaps = (hotel) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.hotelName)}`;
    window.open(url, "_blank");
  };

  // Function to introduce a delay between API calls
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchHotelImages = async () => {
    const API_KEY = import.meta.env.VITE_BING_SEARCH_API_KEY;
    const hotelOptions = trip.tripData.hotel_options || [];

    for (let i = 0; i < hotelOptions.length; i++) {
      const hotel = hotelOptions[i];
      try {
        // Introduce a 1-second delay between requests to avoid hitting the rate limit
        await delay(1000);

        const response = await fetch(`https://api.bing.microsoft.com/v7.0/images/search?q=${encodeURIComponent(hotel.hotelName)}&count=1`, {
          headers: {
            'Ocp-Apim-Subscription-Key': API_KEY,
          },
        });

        if (!response.ok) {
          throw new Error(`Error fetching images: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Images for ${hotel.hotelName}:`, data.value);

        // Store images in the hotelImages state
        setHotelImages((prevImages) => ({
          ...prevImages,
          [hotel.hotelName]: data.value[0]?.thumbnailUrl || '/default-hotel.jpg', // fallback to a default image if no result
        }));
      } catch (error) {
        console.error(`Error fetching images for ${hotel.hotelName}:`, error);
        // Fallback to default image in case of error
        setHotelImages((prevImages) => ({
          ...prevImages,
          [hotel.hotelName]: '/default-hotel.jpg',
        }));
      }
    }
  };

  useEffect(() => {
    fetchHotelImages();
  }, [trip]);

  return (
    <div>
      <h2 className='font-bold text-xl mt-5'>Hotel Recommendations</h2>

      {trip?.tripData?.hotel_options && trip.tripData.hotel_options.length > 0 ? (
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {trip.tripData.hotel_options.map((hotel, index) => (
            <div key={index} className='border p-4 rounded-lg shadow-md hover:scale-105 transition-all cursor-pointer flex flex-col'>
              {/* Hotel Image */}
              <img
                src={hotelImages[hotel.hotelName] || '/default-hotel.jpg'}
                alt={hotel.hotelName}
                className='rounded-lg w-full h-48 object-cover mb-2'
                onError={(e) => { e.target.src = '/default-hotel.jpg'; }}
              />

              {/* Hotel Info */}
              <h3 className='font-bold text-lg'>{hotel.hotelName}</h3>
              <p className='text-sm text-gray-600'>{hotel.hotelAddress}</p>
              <p className='mt-2 text-gray-800 font-semibold'>{hotel.price}</p>
              {hotel.rating && <p className='mt-1 text-yellow-500'>⭐ {hotel.rating} Stars</p>}
              {hotel.description && <p className='mt-2 text-sm text-gray-500'>{hotel.description}</p>}

              {/* Google Maps Button */}
              <Button onClick={() => openInGoogleMaps(hotel)} className='mt-2 text-sm flex items-center'>
                <IoLocationSharp className="mr-2" /> View on Maps
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className='mt-5 text-gray-500'>No hotel recommendations available at the moment.</p>
      )}
    </div>
  );
}

export default Hotels;
