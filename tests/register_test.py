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
    return "ci_user_" + ''.join(
        random.choices(string.ascii_lowercase + string.digits, k=6)
    ) + "@example.com"

@pytest.mark.selenium
def test_register_up_to_2fa():
    # allow overriding in CI via env
    base = os.getenv("BASE_URL", "http://localhost")
    register_url = f"{base}/register"
    
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    wait = WebDriverWait(driver, 10)

    try:
        # 1) stub grecaptcha so recaptchaLoaded becomes true immediately
        driver.get("about:blank")
        driver.execute_script("""
            window.grecaptcha = {
              ready: (cb) => cb(),
              execute: () => Promise.resolve('fake-token')
            };
        """)

        # 2) load the real register page
        driver.get(register_url)

        # 3) fill out every field, waiting for it to appear
        wait.until(EC.presence_of_element_located((By.NAME, "username"))).send_keys("ci_user")
        wait.until(EC.presence_of_element_located((By.NAME, "fullname"))).send_keys("CI User")
        wait.until(EC.presence_of_element_located((By.NAME, "email"))).send_keys(generate_random_email())
        wait.until(EC.presence_of_element_located((By.NAME, "nric"))).send_keys("S1234567A")

        # gender radio buttons
        male = wait.until(EC.element_to_be_clickable((By.ID, "male")))
        driver.execute_script("arguments[0].scrollIntoView()", male)
        male.click()

        wait.until(EC.presence_of_element_located((By.NAME, "contactnumber"))).send_keys("91234567")
        wait.until(EC.presence_of_element_located((By.NAME, "dob"))).send_keys("2000-01-01")
        wait.until(EC.presence_of_element_located((By.NAME, "nationality"))).send_keys("Singaporean")
        wait.until(EC.presence_of_element_located((By.NAME, "password"))).send_keys("TestPassword123")
        wait.until(EC.presence_of_element_located((By.NAME, "address"))).send_keys("123 Example St")

        # your Register.jsx uses name="postalcode" and name="unitnumber" :contentReference[oaicite:1]{index=1}
        wait.until(EC.presence_of_element_located((By.NAME, "postalcode"))).send_keys("123456")
        wait.until(EC.presence_of_element_located((By.NAME, "unitnumber"))).send_keys("#01-01")

        # 4) submit and wait for redirect → /setup-2fa
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        wait.until(EC.url_contains("/setup-2fa"))

        assert "/setup-2fa" in driver.current_url

    finally:
        driver.quit()
