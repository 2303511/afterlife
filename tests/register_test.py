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
    return "testuser_" + ''.join(
        random.choices(string.ascii_lowercase + string.digits, k=6)
    ) + "@example.com"

@pytest.mark.selenium
def test_register_up_to_2fa():
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
        # Stub grecaptcha so your form always renders
        driver.get("about:blank")
        driver.execute_script("""
            window.grecaptcha = {
              ready: (cb) => cb(),
              execute: () => Promise.resolve('fake-token')
            };
        """)

        driver.get(register_url)

        # username
        el = wait.until(EC.presence_of_element_located((By.NAME, "username")))
        print("Found field:", el.get_attribute("name"))
        el.send_keys("ci_user")

        # fullname
        el = wait.until(EC.presence_of_element_located((By.NAME, "fullname")))
        print("Found field:", el.get_attribute("name"))
        el.send_keys("CI User")

        # email
        el = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        print("Found field:", el.get_attribute("name"))
        el.send_keys(generate_random_email())

        # nric
        el = wait.until(EC.presence_of_element_located((By.NAME, "nric")))
        print("Found field:", el.get_attribute("name"))
        el.send_keys("S1234567A")

        # gender radio
        male = wait.until(EC.element_to_be_clickable((By.ID, "male")))
        print("Found radio with id:", male.get_attribute("id"))
        driver.execute_script("arguments[0].scrollIntoView()", male)
        male.click()

        # contactnumber
        el = wait.until(EC.presence_of_element_located((By.NAME, "contactnumber")))
        print("Found field:", el.get_attribute("name"))
        el.send_keys("91234567")

        # dob
        el = wait.until(EC.presence_of_element_located((By.NAME, "dob")))
        print("Found field:", el.get_attribute("name"))
        el.send_keys("2000-01-01")

        # nationality
        el = wait.until(EC.presence_of_element_located((By.NAME, "nationality")))
        print("Found field:", el.get_attribute("name"))
        el.send_keys("Singaporean")

        # password
        el = wait.until(EC.presence_of_element_located((By.NAME, "password")))
        print("Found field:", el.get_attribute("name"))
        el.send_keys("TestPassword123")

        # address
        el = wait.until(EC.presence_of_element_located((By.NAME, "address")))
        print("Found field:", el.get_attribute("name"))
        el.send_keys("123 Example St")

        # Before postalcode, dump all input names on the page
        inputs = driver.find_elements(By.TAG_NAME, "input")
        names = [i.get_attribute("name") or i.get_attribute("id") for i in inputs]
        print("All input elements found:", names)

        # postalcode
        el = wait.until(EC.presence_of_element_located((By.NAME, "postalcode")))
        print("Found field:", el.get_attribute("name"))
        el.send_keys("123456")

        # unitnumber
        el = wait.until(EC.presence_of_element_located((By.NAME, "unitnumber")))
        print("Found field:", el.get_attribute("name"))
        el.send_keys("#01-01")

        # submit and wait for redirect
        btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        print("Clicking submit button")
        btn.click()

        wait.until(EC.url_contains("/setup-2fa"))
        print("Redirected to:", driver.current_url)
        assert "/setup-2fa" in driver.current_url

    finally:
        driver.quit()
