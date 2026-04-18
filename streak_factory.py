import os
import random
import subprocess
from datetime import datetime, timedelta
import shutil
import stat

# --- CONFIGURATION ---
BASE_PATH = os.getcwd()
REPO_NAME = "git_streak_vault"
REPO_PATH = os.path.join(BASE_PATH, REPO_NAME)
START_DAYS_BACK = 60
END_DAYS_FORWARD = 60

def handle_remove_readonly(func, path, exc):
    """Force delete read-only files (common on Windows with .git folders)."""
    os.chmod(path, stat.S_IWRITE)
    func(path)

def run_git(command, cwd, env=None):
    """Execute git commands safely."""
    result = subprocess.run(command, shell=True, cwd=cwd, env=env, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running command: {command}")
        print(f"Error: {result.stderr}")
    return result

def automate_streak():
    # 1. Setup Repository (Fresh Rebuild with Robust Cleanup)
    if os.path.exists(REPO_PATH):
        print(f"Cleaning old vault: {REPO_PATH}")
        shutil.rmtree(REPO_PATH, onerror=handle_remove_readonly)
    
    os.makedirs(REPO_PATH)
    print(f"Created fresh repository folder: {REPO_PATH}")
    
    # Initialize Repo
    run_git("git init", REPO_PATH)
    
    # 2. Daily Commits
    start_date = datetime.now() - timedelta(days=START_DAYS_BACK)
    total_days = START_DAYS_BACK + END_DAYS_FORWARD + 1
    
    print(f"Initializing Perfect History Painting for {total_days} days...")

    # Set organic-looking config locally for this repo
    run_git('git config user.name "Sushant"', REPO_PATH)
    run_git('git config user.email "sushant18072002@gmail.com"', REPO_PATH)

    for i in range(total_days):
        target_date = start_date + timedelta(days=i)
        
        # Determine number of commits (Random 2 to 5 as requested)
        num_commits = random.randint(2, 5)
        
        # SKIP LOGIC REMOVED FOR 100% COVERAGE

        for c in range(num_commits):
            # Unique content per commit
            hour = random.randint(9, 21)
            minute = random.randint(0, 59)
            second = random.randint(0, 59)
            timestamp = target_date.replace(hour=hour, minute=minute, second=second).strftime('%Y-%m-%d %H:%M:%S')

            # Random filenames for "random file" request
            file_variants = ["core", "utils", "api", "ui", "patch", "logic", "styles"]
            filename = f"{random.choice(file_variants)}_{target_date.strftime('%Y%m%d')}_{c}.txt"
            filepath = os.path.join(REPO_PATH, filename)
            
            with open(filepath, "w") as f:
                f.write(f"Contribution entry for {timestamp}\nRandom seed: {random.random()}\n")
            
            # Backdating environment
            env = os.environ.copy()
            env["GIT_AUTHOR_DATE"] = timestamp
            env["GIT_COMMITTER_DATE"] = timestamp

            run_git("git add .", REPO_PATH)
            commit_msg = f"Update: Implementing {random.choice(file_variants)} refinement for sequence {c}"
            run_git(f'git commit -m "{commit_msg}"', REPO_PATH, env=env)

        print(f"Generated {num_commits} commits for {target_date.date()}")

    print("\nLocal Streak Generation Complete.")
    print("Verification: Check 'git log --oneline' in the vault directory.")

if __name__ == "__main__":
    automate_streak()
