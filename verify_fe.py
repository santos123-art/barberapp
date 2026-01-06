
from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            print("Navigating to home page...")
            page.goto("http://localhost:8081")

            # Wait for redirection to login (since not authenticated)
            print("Waiting for redirection...")
            page.wait_for_timeout(5000)

            print("Taking screenshot of login page...")
            page.screenshot(path="verification_login.png")

            # Check if we are on login page
            title = page.title()
            print(f"Page title: {title}")

            # Try to click "Cadastre-se" to go to register
            print("Navigating to register...")
            page.get_by_text("Cadastre-se").click()
            page.wait_for_timeout(2000)
            page.screenshot(path="verification_register.png")

            print("Verification script finished.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_frontend()
