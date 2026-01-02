import csv
import random

# Configuration
TOTAL_ROWS = 4000
REGIONS = {
    "India": 0.60,
    "Global": 0.40
}
CATEGORIES = {
    "Tech": 0.45,
    "Gaming": 0.40,
    "Professional": 0.15
}
TIERS = {
    "Mega": 0.01,  # 1M+
    "Mid": 0.19,   # 100k - 1M
    "Micro": 0.80  # 10k - 100k
}

# Data Pools for Realism
INDIAN_NAMES = ["Rahul", "Amit", "Priya", "Sneha", "Vikram", "Rohan", "Anjali", "Karan", "Arjun", "Nisha", "Tech", "Gamer", "Zone", "World", "Official"]
GLOBAL_NAMES = ["Alex", "Sarah", "Mike", "Jessica", "David", "Emma", "Chris", "Tom", "Anna", "Ryan", "Tech", "Plays", "Gaming", "Hub", "TV"]
PLATFORMS = ["YouTube", "Instagram", "YouTube/Instagram", "Twitch", "Twitter/X"]

def generate_handle(name, category, tier):
    suffix = str(random.randint(1, 999))
    if tier == "Mega":
        return f"@{name.lower().replace(' ', '')}"
    return f"@{name.lower().replace(' ', '')}_{category.lower()}{suffix}"

def get_contact_value(tier):
    if tier == "Mega": return f"High (${random.randint(5, 50)}k+)"
    if tier == "Mid": return f"Medium (${random.randint(1, 5)}k)"
    return f"Low (${random.randint(100, 900)})"

def get_conversion_rate(tier, category):
    base = 2.0
    if tier == "Micro": base += 2.5  # Micro has higher conversion
    if tier == "Mid": base += 1.0
    if category == "Tech": base += 0.5
    return f"{round(random.uniform(base - 0.5, base + 1.0), 2)}%"

def generate_row():
    # Determine Region
    region = "India" if random.random() < REGIONS["India"] else "Global"
    
    # Determine Country & Language
    if region == "India":
        country = "India"
        language = random.choice(["Hindi", "Hindi/English", "English", "Tamil", "Telugu", "Marathi"])
        name_pool = INDIAN_NAMES
    else:
        country = random.choice(["USA", "UK", "Canada", "Australia", "Germany"])
        language = "English"
        name_pool = GLOBAL_NAMES

    # Determine Category
    rand_cat = random.random()
    if rand_cat < 0.45: category = "Tech"
    elif rand_cat < 0.85: category = "Gaming"
    else: category = "Professional"

    # Determine Tier
    rand_tier = random.random()
    if rand_tier < 0.01: tier = "Mega"
    elif rand_tier < 0.20: tier = "Mid"
    else: tier = "Micro"

    # Construct Identity
    base_name = f"{random.choice(name_pool)} {random.choice(name_pool)}" if random.random() > 0.5 else f"{random.choice(name_pool)}{category}"
    handle = generate_handle(base_name, category, tier)
    
    return [
        base_name,
        random.choice(PLATFORMS),
        country,
        language,
        handle,
        get_contact_value(tier),
        f"https://platform.com/{handle.replace('@', '')}",
        get_conversion_rate(tier, category),
        category,
        tier,
        "Mock Data - Ready for Outreach"
    ]

# Generate File
with open('influencer_database_4000.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(["Name", "Platforms", "Country", "Language", "Handle", "Contact_Value", "Source_Link", "Est_Conversion_Rate", "Category", "Tier", "Notes"])
    
    # Add some real anchors first
    real_anchors = [
        ["Tanmay Bhat", "YouTube", "India", "Hindi", "@tanmaybhat", "High ($10k+)", "https://youtube.com/tanmaybhat", "3.5%", "Tech/Comedy", "Mega", "Anchor"],
        ["Mortal", "YouTube", "India", "Hindi", "@mortal", "High ($8k+)", "https://youtube.com/mortal", "3.2%", "Gaming", "Mega", "Anchor"],
        ["Technical Guruji", "YouTube", "India", "Hindi", "@technicalguruji", "High ($15k+)", "https://youtube.com/technicalguruji", "2.1%", "Tech", "Mega", "Anchor"],
        ["Marques Brownlee", "YouTube", "USA", "English", "@mkbhd", "Very High ($100k+)", "https://youtube.com/mkbhd", "1.5%", "Tech", "Mega", "Global Anchor"],
        ["CarryMinati", "YouTube", "India", "Hindi", "@carryminati", "Very High ($25k+)", "https://youtube.com/carryminati", "4.0%", "Gaming", "Mega", "Anchor"]
    ]
    writer.writerows(real_anchors)

    # Generate remaining rows
    for _ in range(TOTAL_ROWS - len(real_anchors)):
        writer.writerow(generate_row())

print(f"Successfully generated 'influencer_database_4000.csv' with {TOTAL_ROWS} rows.")
