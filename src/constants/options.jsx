export const SelectTravelOptionsList = [
    {
      id: 1,
      title: 'Family Trip',
      desc: 'A perfect getaway for the entire family',
      icon: '👨‍👩‍👧‍👦',
      people: '4 People',
    },
    {
      id: 2,
      title: 'Friends',
      desc: 'A fun trip with your friends',
      icon: '👫',
      people: '4 People',
    },
    {
      id: 3,
      title: 'Corporate Retreat',
      desc: 'A trip designed for team bonding and relaxation',
      icon: '🏢',
      people: '10+ People',
    },
    {
      id: 4,
      title: 'Adventure Seekers',
      desc: 'An adventurous journey for thrill-seekers',
      icon: '⛰',
      people: '3-5 People',
    },
    {
      id: 5,
      title: 'Luxury Vacation',
      desc: 'A lavish and relaxing experience',
      icon: '💎',
      people: '2 People',
    }
  ];

  export const SelectBudgetOptions = [
    {
      id: 1,
      title: 'Budget-Friendly',
      desc: 'Affordable options for cost-conscious travelers',
      icon: '💸',
      budgetRange: '$0 - $500',
    },
    {
      id: 2,
      title: 'Mid-Range',
      desc: 'Comfortable choices at a reasonable price',
      icon: '💵',
      budgetRange: '$500 - $1500',
    },
    {
      id: 3,
      title: 'Luxury',
      desc: 'High-end experiences for a premium price',
      icon: '💰',
      budgetRange: '$1500 - $5000',
    },
    {
      id: 4,
      title: 'Ultra-Luxury',
      desc: 'Exclusive experiences with no expense spared',
      icon: '💎',
      budgetRange: '$5000+',
    }
  ];

  export const AI_PROMPT = `Generate Travel Plan for location: {location}, for {totalDays} days for {traveler} with a {budget} budget. Suggest hotel options with HotelName, Hotel Address, Price, Hotel image URL, geo coordinates, rating, description, and an itinerary with PlaceName, Place Details, Place image URL, geo coordinates, ticket pricing, and travel time for each location for {totalDays} days. Please organize the itinerary day-wise with the best times to visit in JSON format.`;