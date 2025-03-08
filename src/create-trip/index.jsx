import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { SelectBudgetOptions, SelectTravelOptionsList , AI_PROMPT} from '@/constants/options';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { channel } from 'process';
import { db } from '@/service/Firebaseconfig';
import { doc, setDoc } from "firebase/firestore"; 
import { chatSession } from '@/service/AIModal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useGoogleLogin } from '@react-oauth/google';
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Navigate, useNavigate } from 'react-router-dom';



function CreateTrip() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [formData, setFormData] = useState([]);
  const [openDialog,setOpenDialog] = useState(false);
const[loading,setLoading]=useState(false)
 
  const navigate = useNavigate();
  const handleInputChange = (name, val) => {
    
    setFormData({
      ...formData,
      [name]: val,
    });
  };

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  const fetchLocations = async () => {
    if (searchQuery.trim() === '') return;

    try {
      const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json`, {
        params: {
          access_token: import.meta.env.VITE_MAPBOX_API_KEY,
          limit: 5, // Limit the number of results
        },
      });

      setLocations(response.data.features);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [searchQuery]);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    handleInputChange('location', location);
    setSearchQuery(location.place_name); // Optionally set the search query to the selected place
    setLocations([]); // Clear the dropdown options after selection
  };

  const login = useGoogleLogin({
    onSuccess: (codeResp) => {
      console.log(codeResp);
      GetUserProfile(codeResp); // Fetch user profile after successful login
    },
    onError: (error) => console.log(error),
  });
  
  const GetUserProfile = (tokeninfo) => {
    axios
      .get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokeninfo?.access_token}`, {
        headers: {
          Authorization: `Bearer ${tokeninfo?.access_token}`,
          Accept: 'application/json',
        },
      })
      .then((response) => {
        console.log('User Info:', response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        setOpenDialog(false); // Close the dialog after successful sign-in and storing user info
      })
      .catch((error) => {
        console.error('Error fetching user profile:', error);  // Handle error
      });
  };
  
  
  const OnGenerateTrip = async () => {
    const user = localStorage.getItem('user');
    
    if (!user) {
      setOpenDialog(true);
      return;  // Ensure the function exits if there's no user
    }
    
    if (formData?.noOfDays > 10 && (!formData?.location || !formData?.budget || !formData?.travellers)) {
      toast("Please fill all the details");
      return;  // Stop execution if required fields are not filled
    }
  
    setLoading(true);  // Set loading to true
    toast("Generating trip");
  
    const FINAL_PROMPT = AI_PROMPT.replace("{location}", formData?.location.place_name)
      .replace("{totalDays}", formData?.noOfDays)
      .replace("{traveler}", formData?.travellers)
      .replace("{budget}", formData?.budget);
  
    try {
      const result = await chatSession.sendMessage(FINAL_PROMPT);
      const tripDataText = result?.response?.text();
      
      console.log("Generated Trip Data:", tripDataText); // Log the raw output
  
      await SaveAiTrip(tripDataText);  // Save the generated trip data
    } catch (error) {
      console.error("Error generating trip:", error);
      toast("Failed to generate trip. Please try again.");
    } finally {
      setLoading(false);  // Set loading to false after operation
    }
  };
  
  const SaveAiTrip = async (TripData) => {
    setLoading(true);  // Set loading to true
  
    const user = JSON.parse(localStorage.getItem('user'));
    const docid = Date.now().toString();
    
    let parsedTripData;
    try {
      parsedTripData = JSON.parse(TripData);// Try parsing the trip data
    } catch (error) {
      console.error("Failed to parse TripData:", error);
      toast("Failed to generate trip data. Please try again.");
      setLoading(false);
      return;
    }
  
    try {
      await setDoc(doc(db, "aitp", docid), {
        userSelection: formData,
        tripData: parsedTripData,
        userEmail: user?.email,
        id: docid
      });
  
      navigate(`/view-trip/${docid}`);
    } catch (error) {
      console.error("Error saving trip data:", error);
      toast("Failed to save trip data. Please try again.");
    } finally {
      setLoading(false);  // Set loading to false after operation
    }
  };
  
 

  return (
    <div className='sm:px-10 md:px-32 lg:px-56 xl:px-10 px-5'>
      <h2 className='font-bold text-3xl my-10'>Tell us your travel preferences</h2>
      <p className='mt-3 text-gray-500 text-xl'>
        Just provide some basic information, and our trip planner will generate a customized itinerary based on your preferences.
      </p>
      <div className='mt-20 flex flex-col gap-10'>
        {/* Destination Input */}
        <div>
          <h3 className='text-xl my-3 font-medium'>What is your destination of choice?</h3>
          <Input 
            placeholder='Search for a place'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {locations.length > 0 && (
            <ul className='mt-2 border border-gray-300 rounded-md'>
              {locations.map((location) => (
                <li
                  key={location.id}
                  className='p-2 cursor-pointer hover:bg-gray-100'
                  onClick={() => handleLocationSelect(location)}
                >
                  {location.place_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Trip Duration Input */}
        <div>
          <h3 className='text-xl my-3 font-medium'>Enter the number of days of the trip</h3>
          <Input placeholder='Ex - 3' type='number' onChange={(e) => handleInputChange('noOfDays', e.target.value)} />
        </div>

        {/* Budget Options */}
        <div>
          <h3 className='text-xl my-3 font-medium'>Tell Us About Your Budget</h3>
          <div className='grid grid-cols-4 gap-5 mt-5'>
            {SelectBudgetOptions.map((item, index) => (
              <div key={index} className={`p-4 rounded-lg hover:shadow cursor-pointer 
                ${formData?.budget == item.budgetRange && 'border border-black shadow-lg'}`}
                onClick={() => handleInputChange('budget', item.budgetRange)}>
                <h3 className='text-lg font-semibold'>{item.icon}</h3>
                <h3 className='text-md font-bold'>{item.title}</h3>
                <p className='text-sm text-gray-600'>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Travel Buddies Options */}
        <div>
          <h3 className='text-xl my-3 font-medium'>Tell Us About Your Travel Buddies!</h3>
          <div className='grid grid-cols-5 gap-5 mt-5'>
            {SelectTravelOptionsList.map((item, index) => (
              <div key={index} 
                onClick={() => handleInputChange('travellers', item.title)}
                className={`p-4 rounded-lg hover:shadow cursor-pointer ${formData?.travellers == item.title && 'border border-black shadow-lg'} `}>
                <h3 className='text-lg font-semibold'>{item.icon}</h3>
                <h3 className='text-md font-bold'>{item.title}</h3>
                <p className='text-sm text-gray-600'>{item.desc}</p>
                <h3 className='text-sm text-gray-600'>{item.people}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div>
        <Button 
        disabled={loading}
        onClick={OnGenerateTrip} variant="black" size="default">
          {loading?
          <AiOutlineLoading3Quarters className='h-7 w-7 animate-spin' />:
          "Generate Trip!"}
          </Button>
      </div>
      <Dialog open={openDialog}>
  
      <DialogContent>
            <DialogHeader>
              <DialogDescription className="flex flex-col items-center text-center">
    {/* Title & Home Icon */}
    <div className="flex items-center gap-3">
      <h2 className="text-4xl font-extrabold">Itinero</h2>
      <a href="/" className="text-3xl text-black hover:text-gray-700">
        <IoMdHome />
      </a>
    </div>
  
    {/* Sign-in Text */}
    <h2 className="font-bold text-lg mt-7">Sign in with Google</h2>
    <p className="text-gray-600">Sign in to the App with Google Authentication Securely</p>
  
    {/* Google Sign-in Button */}
    <Button 
      onClick={() => login()} 
      variant="default" 
      className="bg-black text-white w-full mt-5"
    >
      Sign in with Google
    </Button>
  </DialogDescription>
  
            </DialogHeader>
          </DialogContent>
</Dialog>

    </div>
  );
}

export default CreateTrip;
