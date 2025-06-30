import time
import random
import string
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager


def generate_random_email():
    return f"user_{''.join(random.choices(string.ascii_lowercase, k=6))}@example.com"


def test_register_with_selenium():
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)

    try:
        driver.get("http://localhost/register")

        wait = WebDriverWait(driver, 10)

        wait.until(EC.presence_of_element_located((By.NAME, "username"))).send_keys("ci_user")
        driver.find_element(By.NAME, "fullname").send_keys("CI User")
        driver.find_element(By.NAME, "email").send_keys(generate_random_email())
        driver.find_element(By.NAME, "nric").send_keys("S1234567A")

        # Wait and click gender radio button
        male_radio = wait.until(EC.element_to_be_clickable((By.ID, "male")))
        driver.execute_script("arguments[0].scrollIntoView(true);", male_radio)
        male_radio.click()

        driver.find_element(By.NAME, "contactnumber").send_keys("91234567")
        driver.find_element(By.NAME, "dob").send_keys("2000-01-01")
        driver.find_element(By.NAME, "nationality").send_keys("Singaporean")
        driver.find_element(By.NAME, "password").send_keys("TestPassword123")
        driver.find_element(By.NAME, "address").send_keys("123 Example St")

        wait.until(EC.presence_of_element_located((By.NAME, "postalcode"))).send_keys("123456")
        wait.until(EC.presence_of_element_located((By.NAME, "unitnumber"))).send_keys("#01-01")

        # Submit form
        submit_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']")))
        submit_btn.click()

        # Verify navigation to login page
        wait.until(EC.url_contains("/login"))

    finally:
        driver.quit()
