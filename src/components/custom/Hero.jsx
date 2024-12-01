import React from 'react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom'; // Ensure you have this import if you're using Link


function Hero() {
  return (
    <div className="flex flex-col items-center mx-56 gap-6 mt-16">
      <h1 className="font-extrabold text-[60px] text-center">
        <span className="text-red-500">Discover Your Next Adventure with AI:</span> Personalized Itineraries at Your Fingertips
      </h1>
      <p  className="text-xl text-gray-500 text-center">
        Your personal trip planner and travel curator, creating custom itineraries tailored to your interests and budget
      </p>
      <Link to={"/create-trip"}>
      <Button variant="black" size="default">Get Started.. It's free!!</Button>
      </Link>

    </div>
  );
}


export default Hero