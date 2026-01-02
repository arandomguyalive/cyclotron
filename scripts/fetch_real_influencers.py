import csv
import json
import urllib.request
import urllib.parse

# CONFIGURATION
API_KEY = "YOUR_API_KEY_HERE"  # Replace this or input at runtime
KEYWORDS = ["Tech India", "Gaming India", "Coding India", "Review India", "Vlog India", "Tech Review USA", "Gaming USA"]
MAX_RESULTS_PER_KEYWORD = 50

def fetch_youtube_creators(api_key):
    creators = []
    base_url = "https://www.googleapis.com/youtube/v3/search"

    for keyword in KEYWORDS:
        print(f"Fetching creators for: {keyword}...")
        params = {
            "part": "snippet",
            "q": keyword,
            "type": "channel",
            "maxResults": MAX_RESULTS_PER_KEYWORD,
            "key": api_key
        }
        url = f"{base_url}?{urllib.parse.urlencode(params)}"
        
        try:
            with urllib.request.urlopen(url) as response:
                data = json.loads(response.read().decode())
                
                for item in data.get("items", []):
                    snippet = item["snippet"]
                    creators.append([
                        snippet["channelTitle"],
                        "YouTube",
                        "India" if "India" in keyword else "Global",
                        "English/Hindi",
                        f"@{snippet['channelTitle'].replace(' ', '')}",
                        "Unknown (Requires Outreach)",
                        f"https://youtube.com/channel/{snippet['channelId']}",
                        "2.0% (Est)",
                        keyword.split()[0], # Category
                        "Varies",
                        "Real Data Fetched via API"
                    ])
        except Exception as e:
            print(f"Error fetching {keyword}: {e}")

    return creators

if __name__ == "__main__":
    key = input("Enter YouTube Data API Key (or press Enter if hardcoded): ") or API_KEY
    if key == "YOUR_API_KEY_HERE":
        print("Please provide a valid API Key.")
    else:
        real_data = fetch_youtube_creators(key)
        
        filename = "real_influencers_fetched.csv"
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(["Name", "Platforms", "Country", "Language", "Handle", "Contact_Value", "Source_Link", "Est_Conversion_Rate", "Category", "Tier", "Notes"])
            writer.writerows(real_data)
        
        print(f"Successfully fetched {len(real_data)} real creators to '{filename}'.")
