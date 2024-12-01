import { Button } from '@/components/ui/button';
import React, { useEffect, useState, useRef } from 'react';
import { IoIosSend } from "react-icons/io";
import axios from 'axios';

function Info({ trip }) {
  console.log("tripdata received in info",trip);
  

  const [imageUrl, setImageUrl] = useState('/landscape.jpg');

  // Fetch place image from Bing
  const fetchPlaceImage = async (placeName) => {
    const bingSearchKey = import.meta.env.VITE_BING_SEARCH_API_KEY;

    if (!bingSearchKey) {
      console.error("Bing API Key is missing.");
      return;
    }

    try {
      const response = await axios.get('https://api.bing.microsoft.com/v7.0/images/search', {
        headers: { 'Ocp-Apim-Subscription-Key': bingSearchKey },
        params: {
          q: placeName,
          count: 1,
        },
      });

      if (response.data.value && response.data.value.length > 0) {
        setImageUrl(response.data.value[0].contentUrl);
      } else {
        console.log("No images found.");
      }
    } catch (error) {
      console.error("Error fetching place image:", error);
    }
  };

  useEffect(() => {
    if (trip ) {
      console.log("Trip data is now available:", trip);
      const placeName = trip?.userSelection?.location?.place_name;
      if (placeName) {
        console.log(`Fetching image for: ${placeName}`);
        fetchPlaceImage(placeName);
      } else {
        console.log("No place name available to fetch image for.");
      }
    } else {
      console.log("Trip data is not yet available.");
    }
  }, [trip]);
  const prevTripRef = useRef(null);

useEffect(() => {
  if (trip && JSON.stringify(trip) !== JSON.stringify(prevTripRef.current)) {
    console.log("Received trip data:", trip);
    prevTripRef.current = trip;
  }
}, [trip]);

  
  

  return (
    <div>
      {/* Main Banner Image */}
      <img 
        src={imageUrl} 
        alt="Main place image" 
        className="h-[400px] w-full object-cover rounded-xl" 
        style={{ objectFit: 'cover', width: '100%', height: '400px', objectPosition: 'top' }} 
      />

      <div className="flex justify-between items-center">
        <div className="my-5 flex flex-col gap-2">
          <h2 className="font-bold text-2xl">{trip?.userSelection?.location?.place_name}</h2>

          <div className="flex gap-5">
            <h2 className="p-1 px-3 bg-gray-200 rounded-full text-gray-500 text-xs md:text-md">
              📅 {trip?.userSelection?.noOfDays} Day 
            </h2>
            <h2 className="p-1 px-3 bg-gray-200 rounded-full text-gray-500 text-xs md:text-md">
              💸 {trip?.userSelection?.budget} Budget
            </h2>
            <h2 className="p-1 px-3 bg-gray-200 rounded-full text-gray-500 text-xs md:text-md">
              🥂 {trip?.userSelection?.travellers} Travellers
            </h2>
          </div>
        </div>

        <Button><IoIosSend /></Button>
      </div>
    </div>
  );
}

export default Info;
