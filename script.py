import requests
from bs4 import BeautifulSoup, NavigableString
from urllib.parse import urlparse, parse_qs, unquote
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter
import csv



def scrape():
    events_data = []
    start_id = 0
    url = 'https://www.trojmiasto.pl/imprezy/kalendarz-imprez/dni,7dni,offset,120.html'
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    links = soup.find_all("a", itemprop="url")

    event_urls = []

    for a in links:
        href = a.get("href")
        if href and "/imprezy/" in href:
            full_url = href
            event_urls.append(full_url)

    event_urls = list(set(event_urls))

    print("Znaleziono:", len(event_urls))
    for event_url in event_urls:
        response = requests.get(event_url)
        soup = BeautifulSoup(response.text, 'html.parser')

        name = soup.find(class_='name')
        name = ''.join(t for t in name.contents if isinstance(t, NavigableString)).strip()

        date = soup.find(class_='imp-details-list-date').text.strip()

        hour = soup.find(class_='imp-details-list-hour')
        if hour is None:
            hour = '19:00'
        else:
            hour = hour.text.strip()

        place_name = soup.find(class_='place-name')
        if place_name is None:
            place_name = 'Ergo Arena'
        else:
            place_name = place_name.text.strip()

        lead = soup.find(class_='lead')
        if lead is None:
            lead = ''
        else:
            lead = lead.text.strip()

        wyniki = []
        for a in soup.find_all("a", class_="imp-date-google-calendar"):
            href = a.get("href", "")
            if not href:
                continue

            qs = parse_qs(urlparse(href).query)
            if "location" not in qs:
                continue

            location_raw = qs["location"][0]
            location = unquote(location_raw)

            parts = [p.strip() for p in location.split(",")]

            if len(parts) >= 3:
                miasto = parts[1]   
                ulica_nr = parts[2] 
                wyniki.append((miasto, ulica_nr))

        if wyniki:
            city, street = wyniki[0]
        else:
            city, street = "", ""
        image = soup.find(class_='thumb-content')
        img_tag = image.find("img") if image else None
        src = img_tag.get("src") if img_tag else None

        ##print(src)

        events_data.append({
            "id": start_id,
            "url": event_url,
            "name": name,
            "date": date.split(",")[0],
            "hour": hour,
            "place_name": place_name,
            "city": city,
            "street": street,
            "image":src,
        })

        start_id += 1
        ##print(events_data)
    return events_data
def add_coords_to_events(events_data):
    geolocator = Nominatim(user_agent="gwiazdy/1.0")
    geocode = RateLimiter(geolocator.geocode, min_delay_seconds=1) 

    for event in events_data:
      
        address_parts = []
        if event.get("street"):
            address_parts.append(event["street"])
        if event.get("city"):
            address_parts.append(event["city"])


        address = ", ".join(address_parts) + ", Polska"
        print("Geokoduję:", address)

        try:
            location = geocode(address)
        except Exception as e:
            print("Błąd geokodowania:", e)
            location = None

        if location:
            event["lat"] = location.latitude
            event["lon"] = location.longitude
        else:
            event["lat"] = None
            event["lon"] = None

    return events_data

events_data=scrape()
eveneciki=add_coords_to_events(events_data)

with open('data.csv', 'w', newline='', encoding="utf-8") as csvfile:
    fieldnames = ['id', 'url', 'name', 'date','hour','place_name','city','street','image','lat','lon']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(eveneciki)




