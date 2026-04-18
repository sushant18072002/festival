import json

def audit():
    try:
        with open(r'e:\flutter\App festival\backend\data\events_2026.json', 'r', encoding='utf-8') as f:
            events = json.load(f)
            
        lotties = []
        audios = set()
        
        for ev in events:
            if 'lottie_overlay' in ev and ev['lottie_overlay']:
                lotties.append(ev['lottie_overlay'])
            if 'ambient_audio_slug' in ev and ev['ambient_audio_slug']:
                audios.add(ev['ambient_audio_slug'])
                
        print("--- UNIQUE LOTTIE OVERLAYS ---")
        seen_lotties = set()
        for l in lotties:
            if l['filename'] not in seen_lotties:
                print(f"File: {l['filename']}, Title: {l['title']}, S3: {l['s3_key']}")
                seen_lotties.add(l['filename'])
                
        print("\n--- AUDIOS IN EVENTS ---")
        event_slugs = sorted(list(audios))
        for a in event_slugs:
            print(a)
            
        with open(r'e:\flutter\App festival\backend\data\ambient_audio_seed.json', 'r', encoding='utf-8') as f:
            audio_seed = json.load(f)
            seed_slugs = {a['slug'] for a in audio_seed}
            
        print("\n--- DANGLING AUDIO SLUGS (In Events but NOT in Seed) ---")
        dangling = [s for s in event_slugs if s not in seed_slugs]
        if dangling:
            for d in dangling:
                print(f"MISSING: {d}")
        else:
            print("NONEFound! All event audios are defined in seed.")
            
        print("\n--- ALL AUDIOS IN SEED ---")
        for a in audio_seed:
            print(f"Slug: {a['slug']}, File: {a['filename']}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    audit()
