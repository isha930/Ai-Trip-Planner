import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { googleLogout } from '@react-oauth/google';
import { useGoogleLogin } from '@react-oauth/google';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from 'react-toastify'; // Import toast for notifications
import axios from 'axios'; // Ensure axios is imported
import { IoMdHome } from "react-icons/io";

function Header() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user'))); // Use state to handle user
  const [openDialog, setOpenDialog] = useState(false);

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
        setUser(response.data); // Update state with user data
        setOpenDialog(false); // Close the dialog after successful sign-in and storing user info
        toast.success("Login successful!"); // Show success toast
        window.location.reload(); // Reload the page to reflect the new user state
      })
      .catch((error) => {
        console.error('Error fetching user profile:', error);  // Handle error
      });
  };

  const login = useGoogleLogin({
    onSuccess: (codeResp) => {
      console.log(codeResp);
      GetUserProfile(codeResp); // Fetch user profile after successful login
    },
    onError: (error) => {
      console.log(error);
      toast.error("Login failed. Please try again."); // Show error toast
    },
  });

  const handleLogout = () => {
    googleLogout(); // Logout from Google
    localStorage.clear(); // Clear the user from localStorage
    setUser(null); // Reset the user state
    toast.info("Logged out successfully!"); // Notify user of logout
  };

  return (
    <header className="flex justify-between items-center p-4 shadow-md" style={{ backgroundColor: "#a19f9f" }}>
    <div className="flex items-center gap-3">
      <h2 className="text-4xl font-extrabold">Itinero</h2>
      <a href="/" className="text-3xl text-black hover:text-gray-700">
        <IoMdHome />
      </a>
    </div>
      <div>
        {user ? (
          <div className='flex items-center gap-5'>
            <a href='/my-trips'>
              <Button variant="outline" className="rounded-full">My Trips</Button>
            </a>
            <Popover>
              <PopoverTrigger>
                <img src={user?.picture} alt="User profile" className='h-[35px] width-[35px] rounded-full' />
              </PopoverTrigger>
              <PopoverContent>
                <h2 className='cursor-pointer' onClick={handleLogout}>Logout</h2>
              </PopoverContent>
            </Popover>
          </div>
        ) : (
          <Button onClick={() => setOpenDialog(true)} variant="default" size="default" className="bg-black text-white">
            Sign in
          </Button>
        )}
      </div>
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in</DialogTitle> {/* Required for accessibility */}
            <DialogDescription>
              <img src="/logo.svg" alt="App logo" />
              <h2 className='font-bold text-lg mt-7'>Sign in with Google</h2>
              <p>Sign in to the App with Google Authentication Securely</p>
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
    </header>
  );
}

export default Header;
