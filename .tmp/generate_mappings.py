
import json
import os
import re
import unicodedata

# Paths
MONSTER_INDEX_PATH = r"c:\Users\Le Zincj\Documents\Trame\public\data\aidedd-complete\monsters-index.json"
IMAGES_DIR = r"c:\Users\Le Zincj\Documents\Trame\public\data\aidedd-complete\images"
OUTPUT_FILE = r"c:\Users\Le Zincj\Documents\Trame\new_monster_mappings.ts"

def normalize_name(name):
    # Remove accents
    nfkd_form = unicodedata.normalize('NFKD', name)
    name_no_accents = "".join([c for c in nfkd_form if not unicodedata.combining(c)])
    # Lowercase and replace spaces/special chars with hyphens
    normalized = name_no_accents.lower()
    normalized = re.sub(r'[^a-z0-9]+', '-', normalized)
    return normalized.strip('-')

def main():
    # 1. Load Monster Index
    with open(MONSTER_INDEX_PATH, 'r', encoding='utf-8') as f:
        monsters = json.load(f)
    
    # 2. List Images
    available_images = os.listdir(IMAGES_DIR)
    # Create a map for fast lookup: slug -> filename (without extension)
    image_map = {img.replace('.jpg', ''): img for img in available_images if img.endswith('.jpg')}
    
    # manual override / fuzzy fix map
    # Some french names might map to english slugs or slightly different french slugs
    # We will try to find the best match
    
    new_mappings = {}
    
    print(f"Propcessing {len(monsters)} monsters...")
    
    for monster in monsters:
        name = monster['name']
        normalized = normalize_name(name)
        
        # Strategies to find image:
        match = None
        
        # 1. Exact match of normalized name
        if normalized in image_map:
            match = normalized
            
        # 2. Try English name if available (sometimes useful? though the images seem to use French names mostly based on the list I saw)
        # The list I saw: 'aboleth.jpg', 'aigle.jpg' (french), 'ame-en-peine.jpg' (french), 'androsphinx.jpg' (english/french same)
        # 'chevalier-de-la-mort.jpg' (french)
        # So the images use FRENCH slugs.
        
        if not match:
            # Try to handle comma cases like "Diable, barbu" -> "diable-barbu"
            normalized_comma = normalize_name(name.replace(',', ''))
            if normalized_comma in image_map:
                match = normalized_comma
                
        if not match:
             # Try swapping "Nom, Adjectif" to "Nom Adjectif" or "Adjectif Nom" if needed?
             # Actually "Bandit, capitaine" -> "bandit-capitaine" (in list)
             pass

        if match:
            new_mappings[name] = match
        else:
            # print(f"Missing image for: {name} (normalized: {normalized})")
            pass

    # Generate TS file content
    ts_content = "export const MANUAL_IMAGE_SLUGS: Record<string, string> = {\n"
    
    # Sort by key for readability
    sorted_keys = sorted(new_mappings.keys())
    
    current_char = ''
    for key in sorted_keys:
        first_char = key[0].upper()
        if first_char != current_char:
            ts_content += f"\n    // {first_char}\n"
            current_char = first_char
            
        slug = new_mappings[key]
        # Escape key if needed
        safe_key = key.replace("'", "\\'")
        ts_content += f"    '{safe_key}': '{slug}',\n"
        
    ts_content += "};\n"
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(ts_content)
        
    print(f"Generated mappings for {len(new_mappings)} monsters in {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
