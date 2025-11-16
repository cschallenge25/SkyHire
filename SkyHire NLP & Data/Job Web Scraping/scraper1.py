# transavia_scraper.py - FINAL: 59 JOBS + PROFIL + PERMISSION FIX
from playwright.sync_api import sync_playwright
import csv
import time
import os

BASE_URL = "https://recrutement.transavia.com/fr/annonces"
OUTPUT = os.path.join(os.path.expanduser("~"), "Desktop", "scraping", "transavia_jobs.csv")

# ENSURE FOLDER EXISTS
os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)

def scrape_all_pages():
    all_jobs = []
    seen = set()
    page_num = 1

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        while True:
            url = f"{BASE_URL}?page={page_num}"
            print(f"\nScraping page {page_num}: {url}")

            try:
                page.goto(url, wait_until="networkidle", timeout=30000)
                time.sleep(8)

                if page_num == 1:
                    try:
                        page.click("text=Tout accepter", timeout=10000)
                        time.sleep(3)
                    except:
                        pass

                page.wait_for_selector('.job-ad-card', timeout=20000)
                cards = page.query_selector_all('.job-ad-card')
                if len(cards) == 0:
                    print("No more jobs.")
                    break

                job_links = []
                for card in cards:
                    try:
                        title = card.query_selector('h4.title').inner_text().strip()
                        link_elem = card.query_selector('a.link')
                        link = link_elem.get_attribute('href') if link_elem else ""
                        if link and not link.startswith('http'):
                            link = "https://recrutement.transavia.com" + link
                        if title not in seen:
                            job_links.append((title, link))
                    except:
                        continue

                for title, link in job_links:
                    if title in seen:
                        continue
                    seen.add(title)
                    print(f"  → {title}")

                    try:
                        page.goto(link, wait_until="networkidle", timeout=30000)
                        time.sleep(5)

                        profil = "N/A"
                        try:
                            profil_elem = page.query_selector('h2:has-text("Profil")')
                            if profil_elem:
                                profil = profil_elem.evaluate("""
                                    (el) => {
                                        let content = '';
                                        let next = el.nextElementSibling;
                                        while (next && !next.querySelector('h2')) {
                                            content += next.innerText.trim() + ' ';
                                            next = next.nextElementSibling;
                                        }
                                        return content.trim();
                                    }
                                """)
                            else:
                                desc = page.query_selector('.job-description')
                                profil = desc.inner_text().strip() if desc else "N/A"
                        except:
                            profil = "Error"

                        all_jobs.append({
                            "title": title,
                            "location": "Orly",
                            "apply_link": link,
                            "profil": profil.replace('\n', ' ').replace('\r', ' ')[:500]
                        })

                    except Exception as e:
                        all_jobs.append({
                            "title": title,
                            "location": "Orly",
                            "apply_link": link,
                            "profil": "Failed"
                        })

                page_num += 1

            except Exception as e:
                print(f"Error: {e}")
                break

        context.close()
        browser.close()
    return all_jobs

def save_jobs(jobs):
    # Try to save, if permission error → save to Downloads
    try:
        with open(OUTPUT, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=["title", "location", "apply_link", "profil"])
            writer.writeheader()
            writer.writerows(jobs)
        print(f"\nSUCCESS! {len(jobs)} JOBS + PROFIL SAVED → {OUTPUT}")
    except PermissionError:
        fallback = os.path.join(os.path.expanduser("~"), "Downloads", "transavia_jobs_profil.csv")
        with open(fallback, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=["title", "location", "apply_link", "profil"])
            writer.writeheader()
            writer.writerows(jobs)
        print(f"\nPERMISSION DENIED → SAVED TO: {fallback}")

# RUN
if __name__ == "__main__":
    print("Scraping jobs + PROFIL...")
    jobs = scrape_all_pages()
    save_jobs(jobs)
    print(f"\nYOU HAVE {len(jobs)} JOBS WITH PROFIL!")