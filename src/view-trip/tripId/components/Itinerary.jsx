import React, { useEffect, useState, useCallback } from "react";
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
    const [isLoadingImages, setIsLoadingImages] = useState(false);

    // Function to open a location in Google Maps
    const openInGoogleMaps = useCallback((place) => {
        if (place?.placeName) {
            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                place.placeName
            )}`;
            window.open(url, "_blank");
        } else {
            console.error("PlaceName is missing");
        }
    }, []);

    // Function to fetch place images using Pexels API
    const fetchPlaceImages = useCallback(async () => {
        const API_KEY = import.meta.env.VITE_PEXELS_API_KEY; // Change to Pexels API key
        if (!API_KEY) {
            console.error("Pexels API key is missing");
            setIsLoadingImages(false); // No images to load
            return;
        }

        const newPlaceImages = {};
        setIsLoadingImages(true);

        // Flatten all day plans into a single array
        const allPlaces = itineraryArray.flatMap((item) => item.dayPlan);
        const fetchPromises = allPlaces.map(async (plan) => {
            try {
                const response = await fetch(
                    `https://api.pexels.com/v1/search?query=${encodeURIComponent(plan.placeName)}&per_page=1`, // Pexels endpoint
                    {
                        headers: {
                            "Authorization": API_KEY,
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    //Pexels return photos array, so we check if there is any photo in the array
                    newPlaceImages[plan.placeName] = data.photos.length > 0 ? data.photos[0].src.medium : "fallback-image-url.jpg";
                } else {
                    newPlaceImages[plan.placeName] = "fallback-image-url.jpg";
                }
            } catch (error) {
                console.error(`Error fetching image for ${plan.placeName}:`, error);
                newPlaceImages[plan.placeName] = "fallback-image-url.jpg";
            }
        });
        await Promise.all(fetchPromises);
        setPlaceImages(newPlaceImages);
        setIsLoadingImages(false);
    }, [itineraryArray]);

    useEffect(() => {
        fetchPlaceImages();
    }, [fetchPlaceImages]); // Re-run when itinerary changes

    return (
        <div className="mt-12"> {/* Increased top margin */}
            <h2 className="text-3xl font-bold mb-6 text-center"> {/* Bigger heading */}
                Day-wise Travel Itinerary
            </h2>

            {isLoadingImages ? (
                <p className="text-gray-500 text-center">Loading place images...</p>
            ) : (
                <div className="space-y-6">
                    {itineraryArray
                        .filter((item) => item.day && item.day !== "totalDays") // Exclude invalid entries
                        .sort((a, b) => {
                            // Extract numeric part of the 'day' field for sorting
                            const dayA =
                                typeof a.day === "string"
                                    ? parseInt(a.day.replace("day", ""), 10)
                                    : 0;
                            const dayB =
                                typeof b.day === "string"
                                    ? parseInt(b.day.replace("day", ""), 10)
                                    : 0;
                            return dayA - dayB;
                        })
                        .map((item, index) => (
                            <div key={index} className="p-6 border rounded-lg shadow-lg bg-white">
                                <h2 className="text-2xl font-semibold mb-3">
                                    DAY {typeof item.day === "string" ? parseInt(item.day.replace("day", ""), 10) : index + 1}
                                </h2>
                                <p className="text-gray-700 italic mb-4">
                                    <strong>Best time to visit:</strong> {item.bestTimetoVisit || "Anytime"}
                                </p>

                                <div className="space-y-6">
                                    {item.dayPlan.map((plan, i) => {
                                        const ticketPricing = plan.ticketPricing || "Free";
                                        const timeToTravel = plan.timeToTravel || "Flexible timing";
                                        return (
                                            <div
                                                key={i}
                                                className="border-t py-5 flex items-center space-x-6"
                                            >
                                                <img
                                                    src={placeImages[plan.placeName] || "fallback-image-url.jpg"}
                                                    alt={plan.placeName || "Place"}
                                                    className="w-36 h-36 object-cover rounded-lg border-2 border-gray-300"
                                                />
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold">
                                                        {plan.placeName || "Unknown Place"}
                                                    </h3>
                                                    <p className="text-gray-600 mb-2">{plan.placeDetails || "No details available"}</p>
                                                    <p className="text-gray-700">
                                                        <strong>Ticket Pricing:</strong> {ticketPricing}
                                                    </p>
                                                    <p className="text-gray-700">
                                                        <strong>Time to Visit:</strong> {timeToTravel}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => openInGoogleMaps(plan)}
                                                    className="bg-blue-500 text-white p-2 rounded-md shadow-md hover:bg-blue-600 transition"
                                                >
                                                    <IoLocationSharp />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}

export default Itinerary;
