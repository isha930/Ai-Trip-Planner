import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { IoLocationSharp } from "react-icons/io5";

function Hotels({ trip }) {
    // Check if hotel data is available
    if (!trip || !trip.tripData || !trip.tripData.hotel_options) {
        return <div>No hotel data available</div>;
    }

    // Access hotel array directly
    const hotelOptions = trip.tripData.hotel_options;

    const [hotelImages, setHotelImages] = useState({});
    const [isLoadingImages, setIsLoadingImages] = useState(false);

    const openInGoogleMaps = useCallback((hotel) => {
        if (hotel?.hotelName) {
            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                hotel.hotelName
            )}`;
            window.open(url, "_blank");
        } else {
            console.error("hotelName is missing");
        }
    }, []);

    // Function to fetch place images using Pexels API
    const fetchHotelImages = useCallback(async () => {
        const API_KEY = import.meta.env.VITE_PEXELS_API_KEY; // Change to Pexels API key
        if (!API_KEY) {
            console.error("Pexels API key is missing");
            setIsLoadingImages(false); // No images to load
            return;
        }

        const newHotelImages = {};
        setIsLoadingImages(true);

        const fetchPromises = hotelOptions.map(async (hotel) => {
            try {
                const response = await fetch(
                    `https://api.pexels.com/v1/search?query=${encodeURIComponent(hotel.hotelName)}&per_page=1`, // Pexels endpoint
                    {
                        headers: {
                            "Authorization": API_KEY,
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    //Pexels return photos array, so we check if there is any photo in the array
                    newHotelImages[hotel.hotelName] = data.photos.length > 0 ? data.photos[0].src.medium : "/default-hotel.jpg";
                } else {
                    newHotelImages[hotel.hotelName] = "/default-hotel.jpg";
                }
            } catch (error) {
                console.error(`Error fetching image for ${hotel.hotelName}:`, error);
                newHotelImages[hotel.hotelName] = "/default-hotel.jpg";
            }
        })
        await Promise.all(fetchPromises);
        setHotelImages(newHotelImages);
        setIsLoadingImages(false);
    }, [hotelOptions]);

    useEffect(() => {
        fetchHotelImages();
    }, [fetchHotelImages]);

    return (
      <div className="mt-6">
          <h2 className="font-bold text-xl mt-5">Hotel Recommendations</h2>

          {hotelOptions && hotelOptions.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {hotelOptions.map((hotel, index) => (
                      <div
                          key={index}
                          className="border p-4 rounded-lg shadow-md hover:scale-105 transition-all cursor-pointer flex flex-col"
                      >
                          {/* Hotel Image */}
                          <img
                              src={hotelImages[hotel.hotelName] || "/default-hotel.jpg"}
                              alt={hotel.hotelName}
                              className="rounded-lg w-full h-48 object-cover mb-2"
                              onError={(e) => (e.target.src = "/default-hotel.jpg")}
                          />

                          {/* Hotel Info */}
                          <h3 className="font-bold text-lg">{hotel.hotelName || "Unknown Hotel"}</h3>
                          <p className="text-sm text-gray-600">{hotel.hotelAddress || "Address not available"}</p>

                          {/* Hotel Price */}
                          <p className="mt-2 text-gray-800 font-semibold">
                              <strong>Price:</strong> {hotel.price || "Not specified"}
                          </p>

                          {/* Hotel Rating */}
                          {hotel.rating && (
                              <p className="mt-1 text-yellow-500">
                                  ⭐ {parseFloat(hotel.rating).toFixed(1)} Stars
                              </p>
                          )}

                          {/* Hotel Description */}
                          {hotel.description && (
                              <p className="mt-2 text-sm text-gray-500">{hotel.description}</p>
                          )}

                          {/* View on Maps Button */}
                          <button
                              onClick={() => openInGoogleMaps(hotel)}
                              className="mt-3 flex items-center justify-center bg-blue-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-600 transition"
                          >
                              <IoLocationSharp className="mr-2" />
                              View on Maps
                          </button>
                      </div>
                  ))}
              </div>
          ) : (
              <p className="text-gray-500 mt-4">No hotels found.</p>
          )}
      </div>
  );
};

export default Hotels;
