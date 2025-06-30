import time
import random
import string
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

def generate_random_email():
    return ''.join(random.choices(string.ascii_lowercase, k=6)) + "@test.com"

def test_register_with_selenium():
    options = Options()
    options.add_argument("--headless")  # Run without GUI
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(options=options)

    try:
        # Open your frontend (make sure it's running on this port in GitHub Actions)
        driver.get("http://localhost/register")
        time.sleep(1)

        # Fill in form fields
        driver.find_element(By.NAME, "username").send_keys("ci_user")
        driver.find_element(By.NAME, "fullname").send_keys("CI User")
        driver.find_element(By.NAME, "email").send_keys(generate_random_email())
        driver.find_element(By.NAME, "nric").send_keys("S1234567A")
        driver.find_element(By.ID, "male").click()
        driver.find_element(By.NAME, "contactnumber").send_keys("12345678")
        driver.find_element(By.NAME, "dob").send_keys("2000-01-01")
        driver.find_element(By.NAME, "nationality").send_keys("Singaporean")
        driver.find_element(By.NAME, "password").send_keys("TestPass123!")
        driver.find_element(By.NAME, "address").send_keys("123 Test Lane")
        driver.find_element(By.NAME, "postalcode").send_keys("123456")
        driver.find_element(By.NAME, "unitnumber").send_keys("#01-01")

        # Submit the form
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        time.sleep(2)  # Wait for redirect or response

        # Check for success by redirect or page message
        assert "/login" in driver.current_url or "success" in driver.page_source.lower()

    finally:
        driver.quit()
