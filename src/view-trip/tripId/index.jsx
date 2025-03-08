import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { db } from '@/service/Firebaseconfig';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import Info from './components/Info';
import Hotels from './components/Hotels';
import Itinerary from './components/Itinerary';
import Footer from './components/Footer';
import html2pdf from 'html2pdf.js';

function Viewtrip() {
    const { tripId } = useParams();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Normalize trip data
    const normalizeTripData = useCallback((tripData) => {
        if (!tripData || !tripData.tripData) return tripData;

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
                hotelName: hotel.HotelName || hotel.hotelName || "Unknown Hotel",
                hotelAddress: hotel.HotelAddress || hotel.hotelAddress || "Address not available",
                description: hotel.description || "No description available",
                rating: hotel.rating || "Rating not available",
                price: hotel.price !== undefined && hotel.price !== null && hotel.price !== "" ? hotel.price : "Price not available",
            }));
        };

        return {
            ...tripData,
            tripData: {
                ...tripData.tripData,
                itinerary: convertItineraryToArray(tripData.tripData?.itinerary),
                hotel_options: convertHotelsToArray(tripData.tripData?.hotel_options),
            },
        };
    }, []);

    // Fetch trip data
    useEffect(() => {
        const fetchTripData = async () => {
            if (!tripId) {
                setError('No trip ID provided');
                setLoading(false);
                return;
            }

            console.log("🛫 Fetching trip data...");
            setLoading(true);
            setError(null);

            try {
                const docRef = doc(db, "aitp", tripId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const tripData = normalizeTripData(docSnap.data());
                    setTrip(tripData);
                    console.log("✅ Trip data fetched");
                } else {
                    console.error("❌ No such trip found");
                    setError('No such trip found');
                    toast.error('No such Trip Found');
                }
            } catch (err) {
                console.error("❌ Error fetching document:", err);
                setError('Error fetching trip data');
                toast.error('Error fetching trip data');
            } finally {
                setLoading(false);
            }
        };

        fetchTripData();
    }, [tripId, normalizeTripData]);

    const preloadAllImages = async () => {
        const images = document.querySelectorAll('img');
        const imagePromises = Array.from(images).map(img => {
            return new Promise((resolve, reject) => {
                if (img.complete) {
                    resolve();
                } else {
                    img.onload = resolve;
                    img.onerror = reject;
                }
            });
        });
        await Promise.all(imagePromises);
    };
    const handleDownload = useCallback(async () => {
        await preloadAllImages(); // Ensure images are loaded
        await new Promise(resolve => setTimeout(resolve, 300)); // Small delay
    
        const element = document.getElementById("trip-content"); // Target main content
    
        const options = {
            margin: [15, 10, 15, 10], // Top, Left, Bottom, Right
            filename: "trip-details.pdf",
            image: { type: "jpeg", quality: 1 },
            html2canvas: { 
                scale: 2, 
                useCORS: true, // Ensures external images load
                letterRendering: true,
                scrollY: 0, // Prevents unwanted scrolling issues
            },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
        };
    
        // Force proper layout & prevent content overflow
        element.style.width = "700px"; // Adjusted width
        element.style.maxWidth = "700px";
        
        element.style.padding = "10px"; // Adds spacing to prevent squeezing
    
        // Fix images and text layout
        element.querySelectorAll("img").forEach(img => {
            img.style.maxWidth = "50%"; // Ensures images don’t overflow
            img.style.height = "auto";
            img.style.objectFit = "contain"; // Keeps aspect ratio
        });
    
        // Fix spacing in text sections
        element.querySelectorAll("p, h1, h2, h3").forEach(text => {
            text.style.marginBottom = "8px"; // Adds spacing between texts
        });
    
        // Page Breaks Fix
        document.querySelectorAll(".page-break").forEach((el) => {
            el.style.pageBreakAfter = "always"; 
            el.style.marginBottom = "20px"; // Avoids text cutting off
        });
    
        html2pdf().from(element).set(options).save();
    
    }, []);
    
    
    

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
      <div className="relative">
          <div className="flex justify-end mt-6">  
    <button
        onClick={handleDownload}
        className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-700 transition"
    >
        📄 Download PDF
    </button>
</div>
  
          {/* Wrap the main content inside a div with id="trip-content" */}
          <div id="trip-content" className="pd-10 md:px-20 lg:px-44 xl:px-56 bg-white">
              <Info trip={trip} />
              <Hotels trip={trip} />
              <Itinerary trip={trip} />
              <Footer />
          </div>
      </div>
  );
  
}

export default React.memo(Viewtrip);
