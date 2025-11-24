declare module 'amadeus' {
  interface AmadeusFlightOffer {
    id: string;
    price: {
      total: string;
      currency: string;
    };
    itineraries: Array<{
      duration: string;
      segments: Array<{
        departure: {
          iataCode: string;
          at: string;
        };
        arrival: {
          iataCode: string;
          at: string;
        };
      }>;
    }>;
  }

  interface AmadeusHotelLocation {
    hotelId: string;
  }

  interface AmadeusHotelOffer {
    hotel: {
      hotelId: string;
      name: string;
      rating?: number;
      address?: {
        lines?: string[];
      };
    };
    offers: Array<{
      price: {
        total: string;
        currency: string;
      };
    }>;
  }

  export default class Amadeus {
    constructor(config: { clientId: string; clientSecret: string });

    shopping: {
      flightOffersSearch: {
        get(params: {
          originLocationCode: string;
          destinationLocationCode: string;
          departureDate: string;
          returnDate?: string;
          adults: string;
          max?: string;
        }): Promise<{ data: AmadeusFlightOffer[] }>;
      };
      hotelOffersSearch: {
        get(params: {
          hotelIds: string;
          checkInDate: string;
          checkOutDate: string;
          adults: string;
        }): Promise<{ data: AmadeusHotelOffer[] }>;
      };
    };

    referenceData: {
      locations: {
        hotels: {
          byCity: {
            get(params: { cityCode: string }): Promise<{ data: AmadeusHotelLocation[] }>;
          };
        };
      };
    };
  }
}
