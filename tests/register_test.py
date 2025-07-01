def test_register_redirects_to_login(driver):
    base_url = os.getenv("BASE_URL", "http://localhost:3000")
    unique_email = generate_random_email()
    wait = WebDriverWait(driver, 15)

    # 1) Stub XHR
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

    # 2) Load & fill the form (this helper also clicks submit)
    fill_registration_form(driver, base_url, unique_email)

    # 3) Wait for the redirect to /login
    wait.until(lambda d: d.execute_script("return window.location.pathname") == "/login")
    assert "/login" in driver.current_url
