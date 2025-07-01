import os
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
    return "ci_user_" + ''.join(
        random.choices(string.ascii_lowercase + string.digits, k=6)
    ) + "@example.com"

def fill_registration_form(driver, base_url, email):
    driver.get(f"{base_url}/register")

    # --- Fill and verify username ---
    u = driver.find_element(By.NAME, "username")
    u.send_keys("test100")
    assert u.get_attribute("value") == "test100"
    print("Username OK:", u.get_attribute("value"))

    # --- Fill and verify email ---
    e = driver.find_element(By.NAME, "email")
    e.send_keys("test100@mail.com")
    assert e.get_attribute("value") == "test100@mail.com"
    print("Email OK:", e.get_attribute("value"))

    # --- Full name ---
    fn = driver.find_element(By.NAME, "fullname")
    fn.send_keys("test100")
    assert fn.get_attribute("value") == "test100"
    print("Fullname OK:", fn.get_attribute("value"))

    # --- Contact number ---
    cn = driver.find_element(By.NAME, "contactnumber")
    cn.send_keys("99999999")
    assert cn.get_attribute("value") == "99999999"
    print("Contact OK:", cn.get_attribute("value"))

    # --- NRIC ---
    nric = driver.find_element(By.NAME, "nric")
    nric.send_keys("S1234567A")
    assert nric.get_attribute("value") == "S1234567A"
    print("NRIC OK:", nric.get_attribute("value"))

    # --- Date of Birth via JS + verify ---
    dob = driver.find_element(By.NAME, "dob")
    driver.execute_script("arguments[0].value = '2000-01-01';", dob)
    driver.execute_script("""
      arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
      arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
    """, dob)
    # Retrieve it back in the same ISO format
    assert dob.get_attribute("value") == "2000-01-01"
    print("DOB OK:", dob.get_attribute("value"))

    # --- Nationality ---
    nat = driver.find_element(By.NAME, "nationality")
    nat.send_keys("Singaporean")
    assert nat.get_attribute("value") == "Singaporean"
    print("Nationality OK:", nat.get_attribute("value"))

    # --- Address ---
    addr = driver.find_element(By.NAME, "address")
    addr.send_keys("123 Example St")
    assert addr.get_attribute("value") == "123 Example St"
    print("Address OK:", addr.get_attribute("value"))

    # --- Gender radio ---
    male = driver.find_element(By.ID, "male")
    driver.execute_script("arguments[0].scrollIntoView()", male)
    male.click()
    # radios don't have a value attribute on the input, but you can check 'checked'
    assert male.is_selected()
    print("Gender OK: male selected")

    # --- Password ---
    pwd = driver.find_element(By.NAME, "password")
    pwd.send_keys("SecurePass123!")
    assert pwd.get_attribute("value") == "SecurePass123!"
    print("Password OK:", pwd.get_attribute("value"))

    # --- Submit ---
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()


def test_register_redirects_to_login(driver):
    base_url = os.getenv("BASE_URL", "http://localhost")
    unique_email = generate_random_email()
    wait = WebDriverWait(driver, 15)

    fill_registration_form(driver, base_url, unique_email)

    # Submit is inside fill_registration_form; but if you did it outside,
    # it would look like this:
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    print("After click, URL:", driver.current_url)

    # Now wait for client-side redirect to /login
    wait.until(EC.url_contains("/login"))
    assert "/login" in driver.current_url
