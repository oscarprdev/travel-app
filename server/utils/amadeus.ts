import Amadeus from 'amadeus';

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID!,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET!,
});

export interface FlightOffer {
  id: string;
  price: number;
  currency: string;
  outbound: {
    departure: string;
    arrival: string;
    date: string;
    duration: string;
  };
  return?: {
    departure: string;
    arrival: string;
    date: string;
    duration: string;
  };
}

export interface HotelOffer {
  id: string;
  name: string;
  price: number;
  currency: string;
  rating: number;
  address: string;
}

export const searchFlights = async (
  origin: string,
  destination: string,
  departureDate: string,
  returnDate?: string
): Promise<FlightOffer[]> => {
  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      returnDate,
      adults: '1',
      max: '20',
    });

    return response.data.map((offer) => ({
      id: offer.id,
      price: parseFloat(offer.price.total),
      currency: offer.price.currency,
      outbound: {
        departure: offer.itineraries[0].segments[0].departure.iataCode,
        arrival: offer.itineraries[0].segments[offer.itineraries[0].segments.length - 1].arrival.iataCode,
        date: offer.itineraries[0].segments[0].departure.at,
        duration: offer.itineraries[0].duration,
      },
      return: offer.itineraries[1]
        ? {
            departure: offer.itineraries[1].segments[0].departure.iataCode,
            arrival: offer.itineraries[1].segments[offer.itineraries[1].segments.length - 1].arrival.iataCode,
            date: offer.itineraries[1].segments[0].departure.at,
            duration: offer.itineraries[1].duration,
          }
        : undefined,
    }));
  } catch (error) {
    console.error('Amadeus flight search error:', error);
    throw new Error('Failed to search flights');
  }
};

export const searchHotels = async (
  cityCode: string,
  checkInDate: string,
  checkOutDate: string
): Promise<HotelOffer[]> => {
  try {
    const hotelsResponse = await amadeus.referenceData.locations.hotels.byCity.get({
      cityCode,
    });

    if (!hotelsResponse.data.length) {
      return [];
    }

    const hotelIds = hotelsResponse.data.slice(0, 20).map((hotel) => hotel.hotelId);

    const offersResponse = await amadeus.shopping.hotelOffersSearch.get({
      hotelIds: hotelIds.join(','),
      checkInDate,
      checkOutDate,
      adults: '1',
    });

    return offersResponse.data.map((offer) => ({
      id: offer.hotel.hotelId,
      name: offer.hotel.name,
      price: parseFloat(offer.offers[0].price.total),
      currency: offer.offers[0].price.currency,
      rating: offer.hotel.rating || 0,
      address: offer.hotel.address?.lines?.[0] || 'Address not available',
    }));
  } catch (error) {
    console.error('Amadeus hotel search error:', error);
    throw new Error('Failed to search hotels');
  }
};

export { amadeus };
