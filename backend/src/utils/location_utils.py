import json
import os
from typing import Dict, Optional, Tuple

class LocationUtils:
    def __init__(self):
        self.cities = self._load_cities()
    
    def _load_cities(self) -> Dict:
        """Load cities data from JSON file."""
        data_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                                'data', 'cities.json')
        try:
            with open(data_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading cities data: {str(e)}")
            return {}
    
    def get_coordinates(self, city_name: str) -> Optional[Tuple[float, float]]:
        """Get latitude and longitude for a given city name.
        
        Args:
            city_name (str): Name of the city (case insensitive)
            
        Returns:
            Optional[Tuple[float, float]]: Tuple of (latitude, longitude) if found, None otherwise
        """
        city_data = self.cities.get(city_name.lower())
        if city_data:
            return (city_data['lat'], city_data['lng'])
        return None
    
    def get_country(self, city_name: str) -> Optional[str]:
        """Get country for a given city name.
        
        Args:
            city_name (str): Name of the city (case insensitive)
            
        Returns:
            Optional[str]: Country name if found, None otherwise
        """
        city_data = self.cities.get(city_name.lower())
        if city_data:
            return city_data['country']
        return None
    
    def get_all_cities(self) -> Dict:
        """Get all cities data.
        
        Returns:
            Dict: Dictionary of all cities and their data
        """
        return self.cities
    
    def get_cities_by_country(self, country: str) -> Dict:
        """Get all cities in a specific country.
        
        Args:
            country (str): Country name (case sensitive)
            
        Returns:
            Dict: Dictionary of cities in the specified country
        """
        return {
            city: data for city, data in self.cities.items()
            if data['country'] == country
        }
    
    def format_coordinates(self, lat: float, lng: float) -> str:
        """Format coordinates into a human-readable string.
        
        Args:
            lat (float): Latitude
            lng (float): Longitude
            
        Returns:
            str: Formatted coordinate string
        """
        lat_dir = 'N' if lat >= 0 else 'S'
        lng_dir = 'E' if lng >= 0 else 'W'
        return f"{abs(lat)}°{lat_dir}, {abs(lng)}°{lng_dir}"

if __name__ == "__main__":
    # Example usage
    location_utils = LocationUtils()
    
    # Get coordinates for New York
    ny_coords = location_utils.get_coordinates("new york")
    if ny_coords:
        print(f"New York coordinates: {location_utils.format_coordinates(*ny_coords)}")
    
    # Get all US cities
    us_cities = location_utils.get_cities_by_country("USA")
    print("\nUS Cities:")
    for city, data in us_cities.items():
        print(f"{city.title()}: {location_utils.format_coordinates(data['lat'], data['lng'])}") 