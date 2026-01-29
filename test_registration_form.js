const { Builder, By, Key, until, Select } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');

// Helper to take screenshots
async function takeScreenshot(driver, filename) {
    try {
        console.log(`Attempting to save screenshot: ${filename}`);
        let image = await driver.takeScreenshot();
        fs.writeFileSync(filename, image, 'base64');
        console.log(`Screenshot saved: ${filename}`);
    } catch (err) {
        console.error(`Failed to take screenshot ${filename}:`, err);
    }
}

(async function testRegistrationForm() {
    // 1. Setup Driver
    let driver = await new Builder().forBrowser('chrome').build();
    let url = 'file://' + path.resolve(__dirname, 'index.html'); // Assuming local file

    try {
        console.log("=== Flow A: Negative Scenario ===");
        
        // 1. Launch the web page
        await driver.get(url);
        await driver.sleep(1000); // Wait for load

        
        // 2. Print Page URL + Page Title
        let currentUrl = await driver.getCurrentUrl();
        let pageTitle = await driver.getTitle();
        console.log(`URL: ${currentUrl}`);
        console.log(`Title: ${pageTitle}`);

        // 3. Fill the form (Negative: Skip Last Name)
        await driver.findElement(By.id('firstName')).sendKeys('Frugal');
        // Skipped Last Name
        await driver.findElement(By.id('email')).sendKeys('test@example.com');
        await driver.findElement(By.id('phone')).sendKeys('9876543210');
        await driver.findElement(By.css("label[for='male']")).click(); // Gender
        
        // Select Country (Required)
        let countrySelectFlowA = new Select(await driver.findElement(By.id('country')));
        await countrySelectFlowA.selectByVisibleText('India');

        // Other required fields (Password, Confirm, Terms) to isolate Last Name error
        await driver.findElement(By.id('password')).sendKeys('Test@123');
        await driver.findElement(By.id('confirmPassword')).sendKeys('Test@123');
        await driver.findElement(By.id('terms')).click();

        // 4. Click Submit
        let submitBtn = await driver.findElement(By.id('submitBtn'));
        await submitBtn.click();
        
        // 5. Validate Error message for missing Last Name
        // The error appears in #lastNameError
        let lastNameError = await driver.findElement(By.id('lastNameError'));
        await driver.wait(until.elementIsVisible(lastNameError), 2000);
        let errorText = await lastNameError.getText();
        console.log(`Last Name Error Text: ${errorText}`);
        
        if(errorText.includes('required')) {
            console.log("PASS: Last Name validation triggered.");
        } else {
            console.log("FAIL: Last Name validation NOT triggered.");
        }

        // 6. Capture Screenshot: error-state.png
        await takeScreenshot(driver, 'error-state.png');

        console.log("\n=== Flow B: Positive Scenario ===");
        
        // 1. Refill the form with all valid fields
        console.log("Refilling Last Name...");
        await driver.findElement(By.id('lastName')).sendKeys('Testing');
        
        // Refill passwords as they might be cleared upon failed submit
        console.log("Refilling Passwords...");
        await driver.findElement(By.id('password')).clear();
        await driver.findElement(By.id('password')).sendKeys('Test@123');
        await driver.findElement(By.id('confirmPassword')).clear();
        await driver.findElement(By.id('confirmPassword')).sendKeys('Test@123');

        // Check if Terms is still checked
        let terms = await driver.findElement(By.id('terms'));
        if (!(await terms.isSelected())) {
             console.log("Re-checking Terms...");
             await terms.click();
        }
        
        // 4. Submit the form
        console.log("Submitting form...");
        await driver.sleep(1000); // Ensure UI updates
        await submitBtn.click();

        // 5. Validate Success message
        // The popup appears with class .popup-dialog
        let popup = await driver.wait(until.elementLocated(By.css('.popup-dialog')), 5000);
        await driver.wait(until.elementIsVisible(popup), 5000);
        
        let popupText = await popup.getText();
        console.log(`Popup Text: ${popupText}`);
        
        if(popupText.includes('Successful')) {
            console.log("PASS: Registration Successful.");
        } else {
            console.log("FAIL: Registration Failed.");
        }

        // 6. Capture Screenshot: success-state.png
        await takeScreenshot(driver, 'success-state.png');
        
        // Close popup to reset
        await driver.findElement(By.css('.popup-ok')).click();
        await driver.sleep(1000); // Wait for reset

        console.log("\n=== Flow C: Form Logic Validation ===");

        // 1. Change Country → States dropdown should update
        let countrySelect = new Select(await driver.findElement(By.id('country')));
        await countrySelect.selectByVisibleText('India');
        await driver.sleep(500); // Wait for population
        
        let stateSelect = new Select(await driver.findElement(By.id('state')));
        let stateOptions = await stateSelect.getOptions();
        console.log(`India State Options Count: ${stateOptions.length}`);
        if (stateOptions.length > 1) {
            console.log("PASS: States loaded for India.");
        } else {
            console.log("FAIL: States NOT loaded.");
        }

        // 2. Change State → Cities dropdown should update
        // Select 'Maharashtra' (Value might be MH)
        await stateSelect.selectByValue('MH'); 
        await driver.sleep(500);
        
        let citySelect = new Select(await driver.findElement(By.id('city')));
        let cityOptions = await citySelect.getOptions();
        console.log(`Maharashtra City Options Count: ${cityOptions.length}`);
        if (cityOptions.length > 1) {
            console.log("PASS: Cities loaded for Maharashtra.");
        } else {
            console.log("FAIL: Cities NOT loaded.");
        }

        // 3. Password strength validation
        let passField = await driver.findElement(By.id('password'));
        await passField.sendKeys('weak');
        let strengthText = await driver.findElement(By.id('passwordText')).getText();
        console.log(`Password 'weak' Strength: ${strengthText}`);
        
        await passField.clear();
        await passField.sendKeys('Strong@123');
        strengthText = await driver.findElement(By.id('passwordText')).getText();
        console.log(`Password 'Strong@123' Strength: ${strengthText}`);

        // 4. Test Wrong Confirm Password
        let confirmPassField = await driver.findElement(By.id('confirmPassword'));
        await confirmPassField.sendKeys('WrongPass');
        // Trigger blur or input event
        await driver.findElement(By.tagName('body')).click(); 
        
        let confirmError = await driver.findElement(By.id('confirmPasswordError'));
        await driver.wait(until.elementIsVisible(confirmError), 2000);
        let confirmErrorText = await confirmError.getText();
        console.log(`Confirm Password Error: ${confirmErrorText}`);
        
        if(confirmErrorText.includes('match')) {
             console.log("PASS: Mismatch detected.");
        } else {
             console.log("FAIL: Mismatch NOT detected.");
        }

        // 5. Disable submit button check
        // NOTE: In the previous turn, we decided NOT to disable the button 
        // to allow "Required" messages to show on click.
        // So this test step might need adjustment based on current logic.
        // Current Logic: Button is enabled, but clicking it shows errors.
        // Let's verify that clicking it now (with errors) DOES NOT show success popup.
        
        await submitBtn.click();
        // Should NOT see popup, but should see errors
        // Let's check if the confirm password error is still there or if new errors appeared
        let isPopupPresent = await driver.findElements(By.css('.popup-dialog'));
        if(isPopupPresent.length === 0) {
            console.log("PASS: Form did not submit with invalid data.");
        } else {
            console.log("FAIL: Form submitted with invalid data!");
        }

    } catch (e) {
        console.error("An error occurred in main execution:", e);
        if (e.name) console.error("Error Name:", e.name);
        if (e.message) console.error("Error Message:", e.message);
        await takeScreenshot(driver, 'error-exception.png');
    } finally {
        await driver.quit();
    }
})();