import { Button } from '@/components/ui/button';
import React, { useEffect, useState, useCallback } from 'react';
import { IoIosSend } from "react-icons/io";

function Info({ trip }) {
    const [imageUrl, setImageUrl] = useState('/landscape.jpg');
    const [locationName, setLocationName] = useState("Your Destination");

    const fetchPlaceImage = useCallback(async (placeName) => {
        const pexelsApiKey = import.meta.env.VITE_PEXELS_API_KEY;
           
        if (!pexelsApiKey) {
            console.error("Pexels API Key is missing.");
            return;
        }
        try {
            const response = await fetch(
                `https://api.pexels.com/v1/search?query=${encodeURIComponent(placeName)}&per_page=1`,
                {
                    headers: {
                        Authorization: pexelsApiKey,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.photos && data.photos.length > 0) {
                    setImageUrl(data.photos[0].src.large);
                } else {
                    console.log("No images found for:", placeName, ". Using default image.");
                }
            } else {
                console.error(`Error fetching place image for ${placeName}:`, response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error fetching place image:", error);
        }
    }, []);

    useEffect(() => {
        if (trip) {
            console.log("Trip data is now available:", trip);
            const placeName = trip?.userSelection?.location?.place_name;
            if (placeName) {
                console.log(`Fetching image for: ${placeName}`);
                 setLocationName(placeName);
                fetchPlaceImage(placeName);
               
            } else {
                console.log("No place name available to fetch image for.");
            }
        } else {
            console.log("Trip data is not yet available.");
        }
    }, [trip,fetchPlaceImage]);

    return (
        <div className="mt-16 relative">
            {/* Main Banner Image */}
            <div className="relative w-full h-[400px] overflow-hidden rounded-lg">
    <img
        src={imageUrl}
        alt={locationName}
        className="w-full h-full object-cover rounded-lg"
    />
</div>


            {/* Trip Details Below Image */}
            <div className="bg-white shadow-md p-6 md:p-8 rounded-lg mt-4">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center">
                    {locationName}
                </h1>

                {/* Trip Information */}
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                    <h2 className="p-2 px-4 bg-gray-100 rounded-full text-gray-700 text-sm md:text-md flex items-center gap-2">
                        📅 {trip?.userSelection?.noOfDays || "N/A"} Days
                    </h2>
                    <h2 className="p-2 px-4 bg-gray-100 rounded-full text-gray-700 text-sm md:text-md flex items-center gap-2">
                        💸 {trip?.userSelection?.budget || "N/A"} Budget
                    </h2>
                    <h2 className="p-2 px-4 bg-gray-100 rounded-full text-gray-700 text-sm md:text-md flex items-center gap-2">
                        🥂 {trip?.userSelection?.travellers || "N/A"} Travellers
                    </h2>
                </div>
            </div>
        </div>
    );
}

export default Info;
