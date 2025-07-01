import os
import random
import string
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

def generate_random_email():
    """Generate a random email for CI testing."""
    return "ci_user_" + ''.join(
        random.choices(string.ascii_lowercase + string.digits, k=6)
    ) + "@example.com"

@pytest.mark.selenium
def test_register_up_to_2fa():
    # 1) Determine base URL (defaults to port 80)
    base = os.getenv("BASE_URL", "http://localhost")
    register_url = f"{base}/register"

    # 2) Chrome headless setup
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    wait = WebDriverWait(driver, 10)

    try:
        # 3) Stub reCAPTCHA so form renders immediately
        driver.get("about:blank")
        driver.execute_script("""
            window.grecaptcha = {
              ready: (cb) => cb(),
              execute: () => Promise.resolve('fake-token')
            };
        """)

        # 4) Navigate to the registration page
        driver.get(register_url)

        # 5) Fill out Personal Details section
        el = wait.until(EC.presence_of_element_located((By.NAME, "username")))
        el.send_keys("ci_user")

        el = wait.until(EC.presence_of_element_located((By.NAME, "fullname")))
        el.send_keys("CI User")

        el = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        el.send_keys(generate_random_email())

        el = wait.until(EC.presence_of_element_located((By.NAME, "nric")))
        el.send_keys("S1234567A")

        male = wait.until(EC.element_to_be_clickable((By.ID, "male")))
        driver.execute_script("arguments[0].scrollIntoView()", male)
        male.click()

        el = wait.until(EC.presence_of_element_located((By.NAME, "contactnumber")))
        el.send_keys("91234567")

        el = wait.until(EC.presence_of_element_located((By.NAME, "dob")))
        el.send_keys("2000-01-01")

        el = wait.until(EC.presence_of_element_located((By.NAME, "nationality")))
        el.send_keys("Singaporean")

        el = wait.until(EC.presence_of_element_located((By.NAME, "password")))
        el.send_keys("TestPassword123")

        # 6) Fill out Mailing Address section
        el = wait.until(EC.presence_of_element_located((By.NAME, "address")))
        el.send_keys("123 Example St")

        # wait for Mailing Address header to ensure section is loaded
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//h5[text()='Mailing Address']")))

        # locate by placeholder instead of name
        postal = wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, "input[placeholder='Enter postal code']")))
        postal.send_keys("123456")

        unit = wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, "input[placeholder='Enter unit number']")))
        unit.send_keys("#01-01")

        # 7) Submit form and wait for redirect to 2FA setup
        submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit_btn.click()

        wait.until(EC.url_contains("/setup-2fa"))
        assert "/setup-2fa" in driver.current_url

    finally:
        driver.quit()
