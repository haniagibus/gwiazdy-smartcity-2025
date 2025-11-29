import pandas as pd
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter

# === 1. Wczytanie CSV ===
df = pd.read_csv("szkoly.csv", encoding="utf-8")  # <-- zmień nazwę jeśli potrzeba

# === 2. Konfiguracja geolokatora ===
geolocator = Nominatim(user_agent="gpt_geocoder")
geocode = RateLimiter(geolocator.geocode, min_delay_seconds=1)  # bez blokady API

# === 3. Tworzenie kolumn na współrzędne ===
df["Latitude"] = None
df["Longitude"] = None

# === 4. Geokodowanie każdego adresu ===
for i, row in df.iterrows():
    address = f"{row['Adres']}, Polska"   # <-- BIERZE ADRES Z CSV
    
    print(f"📍 Szukam: {address}")

    try:
        loc = geocode(address)
        if loc:
            df.at[i, "Latitude"] = loc.latitude
            df.at[i, "Longitude"] = loc.longitude
            print("   → znaleziono ✔")
        else:
            print("   → brak współrzędnych ✖")

    except Exception as e:
        print("   ⚠ Błąd:", e)
        continue

# === 5. Zapis wyników ===
df.to_csv("szkoly_geo.csv", index=False, encoding="utf-8-sig")
print("\n📄 Zapisano → szkoly_geo.csv")
