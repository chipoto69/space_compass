import sys
import json
import random
from datetime import datetime

def calculate_human_design(birth_date_str, birth_time_str, latitude, longitude):
    try:
        # Parse date and time
        birth_datetime = datetime.strptime(f"{birth_date_str} {birth_time_str}", "%Y-%m-%d %H:%M")
        
        # Types and authorities
        types = ['Generator', 'Projector', 'Manifestor', 'Reflector', 'Manifesting Generator']
        authorities = ['Sacral', 'Emotional', 'Splenic', 'Ego', 'Self', 'Mental Projector', 'Lunar']
        profiles = ['1/3', '1/4', '2/4', '2/5', '3/5', '3/6', '4/6', '4/1', '5/1', '5/2', '6/2', '6/3']
        definitions = ['Single', 'Split', 'Triple Split', 'Quad Split']
        centers = ['Head', 'Ajna', 'Throat', 'G', 'Heart', 'Solar Plexus', 'Sacral', 'Spleen', 'Root']
        
        # Create a seed value from the birth date and location
        seed = int(birth_datetime.timestamp()) + int(latitude * 100) + int(longitude * 100)
        random.seed(seed)
        
        # Select random but deterministic values
        hd_type = types[seed % len(types)]
        
        # Authority depends on type
        if hd_type == 'Generator' or hd_type == 'Manifesting Generator':
            authority = 'Sacral'
        elif hd_type == 'Reflector':
            authority = 'Lunar'
        else:
            # Use a deterministic selection based on birth minute
            auth_index = birth_datetime.minute % (len(authorities) - 2)  # Exclude Sacral and Lunar
            authority = authorities[auth_index]
        
        # Profile is derived from day of birth and month
        profile_index = (birth_datetime.day + birth_datetime.month) % len(profiles)
        profile = profiles[profile_index]
        
        # Definition depends on the birth year
        definition_index = birth_datetime.year % len(definitions)
        definition = definitions[definition_index]
        
        # Generate random "activated" gates (1-64)
        num_gates = 15 + seed % 10  # Between 15 and 24 gates
        all_gates = list(range(1, 65))
        random.shuffle(all_gates)
        gates = sorted(all_gates[:num_gates])
        
        # Determine activated centers based on gates
        activated_centers = []
        for center in centers:
            if random.random() < 0.5:  # 50% chance for each center
                activated_centers.append(center)
        
        # Return the data
        hd_data = {
            'type': hd_type,
            'authority': authority,
            'profile': profile,
            'definition': definition,
            'gates': gates,
            'centers': activated_centers
        }
        
        return hd_data
        
    except Exception as e:
        return {'error': str(e), 'type': 'Unknown', 'authority': 'Unknown'}

if __name__ == "__main__":
    if len(sys.argv) != 5:
        print(json.dumps({'error': 'Incorrect arguments. Required: birth_date birth_time latitude longitude'}))
        sys.exit(1)
    
    birth_date = sys.argv[1]
    birth_time = sys.argv[2]
    latitude = float(sys.argv[3])
    longitude = float(sys.argv[4])
    
    result = calculate_human_design(birth_date, birth_time, latitude, longitude)
    print(json.dumps(result)) 