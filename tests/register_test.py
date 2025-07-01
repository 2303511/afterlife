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
    # 1) Base URL (port 80)
    base = os.getenv("BASE_URL", "http://localhost")
    register_url = f"{base}/register"

    # 2) Headless Chrome
    opts = Options()
    opts.add_argument("--headless")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--window-size=1920,1080")
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=opts
    )
    wait = WebDriverWait(driver, 15)

    try:
        # 3) Stub reCAPTCHA
        driver.get("about:blank")
        driver.execute_script("""
          window.grecaptcha = {
            ready: cb => cb(),
            execute: () => Promise.resolve('fake-token')
          };
        """)

        # 4) Load registration page
        driver.get(register_url)

        # 5) Wait for React mount: page title + header
        wait.until(lambda d: d.execute_script("return document.readyState") == "complete")
        wait.until(EC.visibility_of_element_located((By.TAG_NAME, "h1")))

        # --- Personal Details ---
        wait.until(EC.presence_of_element_located((By.NAME, "username"))).send_keys("ci_user")
        wait.until(EC.presence_of_element_located((By.NAME, "fullname"))).send_keys("CI User")
        wait.until(EC.presence_of_element_located((By.NAME, "email"))).send_keys(generate_random_email())
        wait.until(EC.presence_of_element_located((By.NAME, "nric"))).send_keys("S1234567A")

        male = wait.until(EC.element_to_be_clickable((By.ID, "male")))
        driver.execute_script("arguments[0].scrollIntoView()", male)
        male.click()

        wait.until(EC.presence_of_element_located((By.NAME, "contactnumber"))).send_keys("91234567")
        wait.until(EC.presence_of_element_located((By.NAME, "dob"))).send_keys("2000-01-01")
        wait.until(EC.presence_of_element_located((By.NAME, "nationality"))).send_keys("Singaporean")
        wait.until(EC.presence_of_element_located((By.NAME, "password"))).send_keys("TestPassword123")

        # --- Mailing Address ---
        # Wait for the Mailing Address header to appear
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//h5[contains(text(),'Mailing Address')]")
        ))

        # Address
        addr = wait.until(EC.presence_of_element_located((By.NAME, "address")))
        addr.send_keys("123 Example St")

        # Postal Code (now present by name)
        postal = wait.until(EC.presence_of_element_located((By.NAME, "postalcode")))
        driver.execute_script("arguments[0].scrollIntoView()", postal)
        postal.send_keys("123456")

        # Unit Number
        unit = wait.until(EC.presence_of_element_located((By.NAME, "unitnumber")))
        driver.execute_script("arguments[0].scrollIntoView()", unit)
        unit.send_keys("#01-01")

        # --- Submit & verify redirect ---
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        wait.until(EC.url_contains("/setup-2fa"))
        assert "/setup-2fa" in driver.current_url

    finally:
        driver.quit()
