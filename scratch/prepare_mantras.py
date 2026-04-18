import os
import shutil
import json

def prepare_mantras():
    # Paths
    base_dir = r'e:\flutter\App festival\backend'
    mantra_dir = os.path.join(base_dir, 'assets', 'audio', 'mantras')
    seed_path = os.path.join(base_dir, 'data', 'mantras_seed.json')
    
    # 1. Get existing source files
    sources = [f for f in os.listdir(mantra_dir) if f.endswith('.aac') and '-' in f]
    if not sources:
        print("No source files found in mantras directory.")
        return
        
    print(f"Found {len(sources)} source files.")

    # 2. Get target filenames from seed
    with open(seed_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        targets = [m['audio_file'].split('/')[-1] for m in data]
        
    print(f"Targeting {len(targets)} mantra files.")

    # 3. Map sources to targets (cycling if necessary)
    for i, target_name in enumerate(targets):
        source_name = sources[i % len(sources)]
        src_path = os.path.join(mantra_dir, source_name)
        dst_path = os.path.join(mantra_dir, target_name)
        
        # Only copy if target doesn't exist
        if not os.path.exists(dst_path):
            shutil.copy2(src_path, dst_path)
            print(f"Created: {target_name} (from {source_name})")
        else:
            print(f"Skipping: {target_name} (already exists)")

    print("\n--- Cleaning up original random names ---")
    for s in sources:
        # Don't delete if it's one of our targets (unlikely given names)
        if s not in targets:
            try:
                os.remove(os.path.join(mantra_dir, s))
                print(f"Removed source: {s}")
            except Exception as e:
                print(f"Failed to remove {s}: {e}")

if __name__ == "__main__":
    prepare_mantras()
