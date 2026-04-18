import json
import os

def discovery():
    base_path = r'e:\flutter\App festival\backend\data'
    events_path = os.path.join(base_path, 'events_2026.json')
    audio_seed_path = os.path.join(base_path, 'ambient_audio_seed.json')
    mantras_seed_path = os.path.join(base_path, 'mantras_seed.json')

    inventory = {
        "lotties": set(),
        "audios": set(),
        "mantra_audios": set()
    }

    # 1. Audit Events for Overlays and Audio Slugs
    if os.path.exists(events_path):
        with open(events_path, 'r', encoding='utf-8') as f:
            events = json.load(f)
            for ev in events:
                if 'lottie_overlay' in ev and ev['lottie_overlay']:
                    inventory["lotties"].add(ev['lottie_overlay']['filename'])
                if 'ambient_audio_slug' in ev and ev['ambient_audio_slug']:
                    inventory["audios"].add(f"SLUG:{ev['ambient_audio_slug']}")

    # 2. Audit Audio Seed for filenames
    if os.path.exists(audio_seed_path):
        with open(audio_seed_path, 'r', encoding='utf-8') as f:
            seeds = json.load(f)
            for s in seeds:
                inventory["audios"].add(s['filename'])

    # 3. Audit Mantras for audio files
    if os.path.exists(mantras_seed_path):
        with open(mantras_seed_path, 'r', encoding='utf-8') as f:
            mantras = json.load(f)
            for m in mantras:
                if 'audio_file' in m and m['audio_file']:
                    inventory["mantra_audios"].add(os.path.basename(m['audio_file']))

    print("=== BACKEND LOTTIE INVENTORY ===")
    for l in sorted(list(inventory["lotties"])):
        print(l)

    print("\n=== BACKEND AUDIO INVENTORY ===")
    for a in sorted(list(inventory["audios"])):
        print(a)

    print("\n=== MANTRA AUDIO INVENTORY ===")
    for m in sorted(list(inventory["mantra_audios"])):
        print(m)

if __name__ == "__main__":
    discovery()
