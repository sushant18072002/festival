import json
import os

def check_missing(seed_path, assets_dir, filename_source='filename'):
    if not os.path.exists(seed_path):
        return f"Seed not found: {seed_path}"
    if not os.path.exists(assets_dir):
        return f"Dir not found: {assets_dir}"
        
    with open(seed_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    physical_files = set(os.listdir(assets_dir))
    missing = []
    
    for item in data:
        # For events, it's inside lottie_overlay object
        if 'lottie_overlay' in item:
            fname = item['lottie_overlay'].get('filename')
        # For mantras/originals, it's direct or audio_file
        else:
            fname = item.get(filename_source)
            if not fname and 'audio_file' in item:
                fname = item['audio_file'].split('/')[-1]
        
        if fname and fname not in physical_files:
            missing.append(fname)
            
    return sorted(list(set(missing)))

# Backend Audit
base = r'e:\flutter\App festival\backend'
print("--- BACKEND AUDIT ---")
print("Missing Lotties:", check_missing(os.path.join(base, 'data', 'events_2026.json'), os.path.join(base, 'assets', 'lotties')))
print("Missing Originals:", check_missing(os.path.join(base, 'data', 'ambient_audio_seed.json'), os.path.join(base, 'assets', 'audio', 'originals'), 'filename'))
print("Missing Mantras:", check_missing(os.path.join(base, 'data', 'mantras_seed.json'), os.path.join(base, 'assets', 'audio', 'mantras'), 'audio_file'))

# App Local Audit
app_base = r'e:\flutter\App festival\flutter_app'
print("\n--- APP LOCAL AUDIT ---")
# AssetService uses these 3 specific SFX
expected_sfx = ['chime_success.aac', 'buzz_error.aac', 'tick_interaction.aac']
actual_sfx = os.listdir(os.path.join(app_base, 'assets', 'audio'))
print("Missing SFX:", [s for s in expected_sfx if s not in actual_sfx])

# AssetService Lotties
expected_lotties = ['celebration_confetti.json', 'error_vibration.json', 'loading_mandala.json', 'empty_state_search.json', 'level_up_sparkle.json']
actual_lotties = os.listdir(os.path.join(app_base, 'assets', 'lottie'))
print("Missing Lotties:", [l for l in expected_lotties if l not in actual_lotties])
