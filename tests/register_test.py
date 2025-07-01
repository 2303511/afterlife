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
def test_register_and_redirect_to_login():
    base = os.getenv("BASE_URL", "http://localhost")
    register_url = f"{base}/register"

    # 1) Headless Chrome setup
    opts = Options()
    opts.add_argument("--headless")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--window-size=1920,1080")
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()), options=opts
    )
    wait = WebDriverWait(driver, 15)

    try:
        # 2) Navigate to the register page
        driver.get(register_url)

        # 3) Fill out the form
        wait.until(EC.presence_of_element_located((By.NAME, "username"))).send_keys("ci_user")
        driver.find_element(By.NAME, "email").send_keys(generate_random_email())
        driver.find_element(By.NAME, "fullname").send_keys("CI User")
        driver.find_element(By.NAME, "contactnumber").send_keys("91234567")
        driver.find_element(By.NAME, "nric").send_keys("S1234567A")
        driver.find_element(By.NAME, "dob").send_keys("2000-01-01")
        driver.find_element(By.NAME, "nationality").send_keys("Singaporean")
        driver.find_element(By.NAME, "address").send_keys("123 Example St")

        male = wait.until(EC.element_to_be_clickable((By.ID, "male")))
        driver.execute_script("arguments[0].scrollIntoView()", male)
        male.click()

        driver.find_element(By.NAME, "password").send_keys("TestPassword123")

        # 4) Submit the form
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

        # 5) Wait for React Router to update window.location.pathname to "/login"
        wait.until(lambda d: d.execute_script("return window.location.pathname") == "/login")

        # 6) As a sanity check, also ensure the login form is present
        assert driver.find_element(By.NAME, "username")  # or "email" on your login form

    finally:
        driver.quit()
