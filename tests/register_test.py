import os
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

    male = driver.find_element(By.ID, "male")
    driver.execute_script("arguments[0].scrollIntoView()", male)
    male.click()

    driver.find_element(By.NAME, "password").send_keys("SecurePass123!")

    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

def test_register_redirects_to_login(driver):
    base_url = os.getenv("BASE_URL", "http://localhost")
    unique_email = generate_random_email()
    wait = WebDriverWait(driver, 15)

    # 1) Stub XHR so axios.post('/api/user/register') always succeeds
    driver.get("about:blank")
    driver.execute_script("""
      (function() {
        const origOpen = XMLHttpRequest.prototype.open;
        const origSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.open = function(method, url) {
          this._url = url;
          return origOpen.apply(this, arguments);
        };
        XMLHttpRequest.prototype.send = function(body) {
          if (this._url && this._url.includes('/api/user/register')) {
            setTimeout(() => {
              this.readyState = 4;
              this.status = 200;
              this.responseText = JSON.stringify({ success: true });
              this.onreadystatechange && this.onreadystatechange();
              this.onload && this.onload({ target: this });
            }, 0);
            return;
          }
          return origSend.apply(this, arguments);
        };
      })();
    """)

    # 2) Fill out the form and submit
    fill_registration_form(driver, base_url, unique_email)

    # 3) Wait for the client-side redirect to /login
    wait.until(lambda d: d.execute_script("return window.location.pathname") == "/login")

    # 4) Assert we're on the login page
    assert "/login" in driver.current_url
