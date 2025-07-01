import os
import random
import string
import time
import pytest

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

@pytest.fixture(scope="session")
def driver():
    opts = Options()
    opts.add_argument("--headless")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--window-size=1920,1080")
    drv = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=opts
    )
    drv.implicitly_wait(2)
    yield drv
    drv.quit()

def generate_random_email():
    return "ci_" + ''.join(random.choices(string.ascii_lowercase + string.digits, k=6)) + "@example.com"

def fill_registration_form(driver, base_url, email):
    driver.get(f"{base_url}/register")

    # 2) Fill out and submit the form once
    driver.find_element(By.NAME, "username").send_keys("test100")
    driver.find_element(By.NAME, "email").send_keys(email)
    driver.find_element(By.NAME, "fullname").send_keys("Test User")
    driver.find_element(By.NAME, "contactnumber").send_keys("91234567")
    driver.find_element(By.NAME, "nric").send_keys("S1234567A")

    dob = driver.find_element(By.NAME, "dob")
    driver.execute_script("arguments[0].value = '2000-01-01';", dob)
    driver.execute_script("""
      arguments[0].dispatchEvent(new Event('input',  { bubbles: true }));
      arguments[0].dispatchEvent(new Event('change',{ bubbles: true }));
    """, dob)

    driver.find_element(By.NAME, "nationality").send_keys("Singaporean")
    driver.find_element(By.NAME, "address").send_keys("123 Example St")
    driver.find_element(By.ID, "male").click()
    driver.find_element(By.NAME, "password").send_keys("SecurePass123!")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

def test_register_and_dump_dom(driver):
    base_url = os.getenv("BASE_URL", "http://localhost:8080")
    unique_email = generate_random_email()

    # Fill & submit exactly once
    fill_registration_form(driver, base_url, unique_email)

    # Give React a moment to render the login page
    time.sleep(5)

    # Dump the full live DOM
    full_dom = driver.find_element(By.TAG_NAME, "html").get_attribute("outerHTML")
    print("\n\n===== FULL LIVE DOM =====\n")
    print(full_dom)
    print("\n===== END FULL LIVE DOM =====\n\n")

    assert "/login" in driver.current_url
    assert driver.find_element(By.NAME, "email").is_displayed()
