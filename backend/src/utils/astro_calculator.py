import sys
import json
import ephem
import math
from datetime import datetime
from human_design import calculate_human_design

def calculate_aspects(body1_lon, body2_lon):
    # Calculate the angular distance between two bodies
    diff = abs(body1_lon - body2_lon)
    diff = min(diff, 360 - diff)  # Use the shorter arc
    
    # Define aspect orbs (allowed deviation from exact aspect)
    aspects = {
        0: ('Conjunction', 10),    # 0 degrees
        60: ('Sextile', 6),       # 60 degrees
        90: ('Square', 8),        # 90 degrees
        120: ('Trine', 8),        # 120 degrees
        180: ('Opposition', 10),   # 180 degrees
    }
    
    # Check if the bodies form any aspect
    for angle, (aspect_name, orb) in aspects.items():
        if abs(diff - angle) <= orb:
            return aspect_name
    return None

def calculate_house_cusps(observer):
    # Calculate sidereal time in degrees
    st_deg = observer.sidereal_time() * 180 / math.pi
    
    # Calculate house cusps using Equal House system
    # Each house is 30 degrees apart, starting from the Ascendant
    ascendant_deg = (st_deg - 90) % 360
    house_cusps = [(ascendant_deg + (i * 30)) % 360 for i in range(12)]
    
    return house_cusps

def get_zodiac_and_degrees(degrees):
    zodiac_signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
    
    # Normalize degrees to 0-360 range
    degrees = degrees % 360
    sign_index = int(degrees / 30)
    degrees_in_sign = degrees % 30
    
    return {
        'sign': zodiac_signs[sign_index],
        'degrees': round(degrees_in_sign, 2)
    }

def calculate_astro(birth_date_str, birth_time_str, latitude, longitude):
    try:
        # Parse date and time
        birth_datetime = datetime.strptime(f"{birth_date_str} {birth_time_str}", "%Y-%m-%d %H:%M")
        
        # Set up observer
        observer = ephem.Observer()
        observer.lon = str(longitude)
        observer.lat = str(latitude)
        observer.date = birth_datetime.strftime("%Y/%m/%d %H:%M")
        observer.pressure = 0  # Ignore atmospheric refraction
        
        # Calculate planets
        bodies = {
            'Sun': ephem.Sun(),
            'Moon': ephem.Moon(),
            'Mercury': ephem.Mercury(),
            'Venus': ephem.Venus(),
            'Mars': ephem.Mars(),
            'Jupiter': ephem.Jupiter(),
            'Saturn': ephem.Saturn(),
            'Uranus': ephem.Uranus(),
            'Neptune': ephem.Neptune(),
            'Pluto': ephem.Pluto()
        }
        
        # Calculate positions and store longitudes for aspect calculation
        positions = {}
        longitudes = {}
        
        for name, body in bodies.items():
            body.compute(observer)
            
            # Convert ecliptic longitude to degrees
            lon_deg = body.hlong * 180 / ephem.pi
            longitudes[name] = lon_deg
            
            # Get zodiacal position
            positions[name] = get_zodiac_and_degrees(lon_deg)
        
        # Calculate aspects between planets
        aspects = []
        for name1 in bodies:
            for name2 in list(bodies.keys())[list(bodies.keys()).index(name1) + 1:]:
                aspect = calculate_aspects(longitudes[name1], longitudes[name2])
                if aspect:
                    aspects.append({
                        'bodies': [name1, name2],
                        'aspect': aspect
                    })
        
        # Calculate house cusps
        house_cusps = calculate_house_cusps(observer)
        
        # Calculate precise ascendant (1st house cusp)
        ascendant_deg = house_cusps[0]
        ascendant = get_zodiac_and_degrees(ascendant_deg)
        
        # Calculate Midheaven (10th house cusp)
        mc_deg = house_cusps[9]
        midheaven = get_zodiac_and_degrees(mc_deg)
        
        # Calculate Human Design data
        hd_data = calculate_human_design(birth_date_str, birth_time_str, latitude, longitude)
        
        # Prepare the response data
        astro_data = {
            'sunSign': positions['Sun']['sign'],
            'moonSign': positions['Moon']['sign'],
            'ascendant': ascendant['sign'],
            'midheaven': midheaven['sign'],
            'planets': {
                name: {
                    'sign': pos['sign'],
                    'degrees': pos['degrees'],
                    'longitude': round(longitudes[name], 2)
                } for name, pos in positions.items()
            },
            'aspects': aspects,
            'houses': {
                f"house_{i+1}": get_zodiac_and_degrees(cusp)
                for i, cusp in enumerate(house_cusps)
            },
            'humanDesign': hd_data
        }
        
        # Add lunar phase
        moon = ephem.Moon(observer)
        moon_phase = moon.phase
        next_full = ephem.next_full_moon(observer.date)
        next_new = ephem.next_new_moon(observer.date)
        
        astro_data['moonPhase'] = {
            'percentage': round(moon_phase, 2),
            'phase': 'New' if moon_phase < 25 else
                    'Waxing Crescent' if moon_phase < 50 else
                    'First Quarter' if moon_phase < 75 else
                    'Waxing Gibbous' if moon_phase < 100 else
                    'Full' if moon_phase < 125 else
                    'Waning Gibbous' if moon_phase < 150 else
                    'Last Quarter' if moon_phase < 175 else
                    'Waning Crescent',
            'nextFull': next_full.datetime().strftime("%Y-%m-%d %H:%M"),
            'nextNew': next_new.datetime().strftime("%Y-%m-%d %H:%M")
        }
        
        return astro_data
        
    except Exception as e:
        return {'error': str(e), 'sunSign': 'Unknown'}

if __name__ == "__main__":
    if len(sys.argv) != 5:
        print(json.dumps({'error': 'Incorrect arguments. Required: birth_date birth_time latitude longitude'}))
        sys.exit(1)
    
    birth_date = sys.argv[1]
    birth_time = sys.argv[2]
    latitude = float(sys.argv[3])
    longitude = float(sys.argv[4])
    
    result = calculate_astro(birth_date, birth_time, latitude, longitude)
    print(json.dumps(result)) 