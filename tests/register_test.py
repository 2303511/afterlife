import os
import random
import string
import pytest

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
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
    drv.implicitly_wait(10)
    yield drv
    drv.quit()

def generate_random_email():
    return "ci_user_" + "".join(
        random.choices(string.ascii_lowercase + string.digits, k=6)
    ) + "@example.com"

def fill_registration_form(driver, email):
    # assumes you’re already on /register
    driver.find_element(By.NAME, "username").send_keys("test100")
    driver.find_element(By.NAME, "email").send_keys(email)
    driver.find_element(By.NAME, "fullname").send_keys("Test User")
    driver.find_element(By.NAME, "contactnumber").send_keys("91234567")
    driver.find_element(By.NAME, "nric").send_keys("S1234567A")

    dob = driver.find_element(By.NAME, "dob")
    driver.execute_script("arguments[0].value = '2000-01-01';", dob)
    driver.execute_script("""
      arguments[0].dispatchEvent(new Event('input',{ bubbles: true }));
      arguments[0].dispatchEvent(new Event('change',{ bubbles: true }));
    """, dob)

    driver.find_element(By.NAME, "nationality").send_keys("Singaporean")
    driver.find_element(By.NAME, "address").send_keys("123 Example St")

    male = driver.find_element(By.ID, "male")
    driver.execute_script("arguments[0].scrollIntoView()", male)
    male.click()

    driver.find_element(By.NAME, "password").send_keys("SecurePass123!")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

def test_register_redirects_to_login(driver):
    base_url = os.getenv("BASE_URL", "http://localhost")
    unique_email = generate_random_email()
    wait = WebDriverWait(driver, 15)

    # 1) Load your SPA's register page
    driver.get(f"{base_url}/register")

    # 2) Fill & submit the real form against your test backend
    fill_registration_form(driver, unique_email)

    # 3) Wait for the React client to redirect to /login
    wait.until(lambda d: d.execute_script("return window.location.pathname") == "/login")

    # 4) Final assertion
    assert "/login" in driver.current_url
