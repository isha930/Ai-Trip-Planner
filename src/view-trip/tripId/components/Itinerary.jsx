import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { IoLocationSharp } from "react-icons/io5";

function Itinerary({ trip }) {
  // Check if itinerary data is available
  if (!trip || !trip.tripData || !trip.tripData.itinerary) {
    return <div>No itinerary data available</div>;
  }

  // Access itinerary array directly
  const itineraryArray = trip.tripData.itinerary;

  const [placeImages, setPlaceImages] = useState({}); // Store fetched images

  // Function to open a location in Google Maps
  const openInGoogleMaps = (place) => {
    if (place?.placeName) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        place.placeName
      )}`;
      window.open(url, "_blank");
    } else {
      console.error("PlaceName is missing");
    }
  };

  // Function to fetch place images using Bing API
  const fetchPlaceImages = async () => {
    const API_KEY = import.meta.env.VITE_BING_SEARCH_API_KEY;
    if (!API_KEY) {
      console.error("Bing Search API key is missing");
      return;
    }

    const images = {};

    // Flatten all day plans into a single array
    const allPlaces = itineraryArray.flatMap((item) => item.dayPlan);

    await Promise.all(
      allPlaces.map(async (plan) => {
        try {
          const response = await fetch(
            `https://api.bing.microsoft.com/v7.0/images/search?q=${encodeURIComponent(
              plan.placeName
            )}&count=1`,
            {
              headers: { "Ocp-Apim-Subscription-Key": API_KEY },
            }
          );

          if (response.ok) {
            const data = await response.json();
            images[plan.placeName] = data.value || [];
          } else {
            console.error(
              `Error fetching images for ${plan.placeName}: ${response.statusText}`
            );
          }
        } catch (error) {
          console.error(`Error fetching images for ${plan.placeName}:`, error);
        }
      })
    );

    setPlaceImages(images); // Update state with fetched images
  };

  useEffect(() => {
    fetchPlaceImages();
  }, [itineraryArray]); // Re-run when itinerary changes

  return (
    <div>
      <h2 className="font-bold text-lg">Day-wise Travel Itinerary</h2>
      <div className="space-y-4">
        {itineraryArray
          .filter(item => item.day && item.day !== "totalDays") // Exclude invalid entries
          .sort((a, b) => {
            // Extract numeric part of the 'day' field for sorting
            const dayA = typeof a.day === "string" ? parseInt(a.day.replace("day", ""), 10) : 0;
            const dayB = typeof b.day === "string" ? parseInt(b.day.replace("day", ""), 10) : 0;
            return dayA - dayB;
          })
          .map((item, index) => (
            <div key={index} className="p-4 border rounded-lg shadow-md">
              <h2 className="font-medium text-xl mb-2">
                DAY{" "}
                {typeof item.day === "string"
                  ? parseInt(item.day.replace("day", ""), 10)
                  : index + 1}
              </h2>
              <p className="text-gray-600 italic mb-2">
                Best time to visit: {item.bestTimetoVisit || "Anytime"}
              </p>
              <div className="space-y-4">
                {item.dayPlan.map((plan, i) => {
                  const ticketPricing = plan.ticketPricing || "Free";
                  const timeToTravel = plan.timeToTravel || "Flexible timing";
                  return (
                    <div
                      key={i}
                      className="border-t py-4 flex items-center space-x-4"
                    >
                      <img
                        src={
                          placeImages[plan.placeName]?.[0]?.thumbnailUrl ||
                          "fallback-image-url.jpg"
                        }
                        alt={plan.placeName || "Place"}
                        className="w-32 h-32 object-cover rounded-md border-2 border-gray-300"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {plan.placeName || "Unknown Place"}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {plan.placeDetails || "No details available"}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Ticket Pricing:</strong> {ticketPricing}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Time to Visit:</strong> {timeToTravel}
                        </p>
                      </div>
                      <Button onClick={() => openInGoogleMaps(plan)}>
                        <IoLocationSharp />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
  
}  

export default Itinerary;
