document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registrationForm');
    const submitBtn = document.getElementById('submitBtn');
    const formAlerts = document.getElementById('formAlerts');

    // Input elements
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
const countryCode = document.getElementById('countryCode');
    const age = document.getElementById('age');
    const genderMale = document.getElementById('male');
    const genderFemale = document.getElementById('female');
    const genderOther = document.getElementById('other');
    const address = document.getElementById('address');
    const country = document.getElementById('country');
    const state = document.getElementById('state');
    const city = document.getElementById('city');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const terms = document.getElementById('terms');
    const termsLink = document.getElementById('termsLink'); // For potential modal

    // Error message elements
    const firstNameError = document.getElementById('firstNameError');
    const lastNameError = document.getElementById('lastNameError');
    const emailError = document.getElementById('emailError');
    const phoneError = document.getElementById('phoneError');
    const ageError = document.getElementById('ageError');
    const genderError = document.getElementById('genderError');
    const addressError = document.getElementById('addressError');
    const countryError = document.getElementById('countryError');
    const stateError = document.getElementById('stateError');
    const cityError = document.getElementById('cityError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    const termsError = document.getElementById('termsError');

    // Password strength meter elements
    const passwordStrengthDiv = document.getElementById('passwordStrength');
    const passwordTextSpan = document.getElementById('passwordText');

    // Disposable email domains
    const disposableDomains = [
        "mailinator.com", "tempmail.com", "10minutemail.com", "gettub.com",
        "sharklasers.com", "guerrillamail.com", "mail-tempor.com", "yopmail.com",
        "trashmail.com", "mailburner.com", "throwawayemail.com"
        // Add more as needed
    ];

    // --- Helper Functions ---

    function displayError(element, message) {
        const errorElement = document.getElementById(`${element.id}Error`);
        if (errorElement) {
            errorElement.textContent = message;
        }
        element.classList.add('invalid');
    }

    function clearError(element) {
        const errorElement = document.getElementById(`${element.id}Error`);
        if (errorElement) {
            errorElement.textContent = '';
        }
        element.classList.remove('invalid');
    }

    function showFormAlert(type, message) {
        formAlerts.textContent = message;
        formAlerts.className = 'alerts'; // Reset classes
        formAlerts.classList.add(`alert-${type}`);
        formAlerts.style.display = 'block';
    }

    function hideFormAlert() {
        formAlerts.textContent = '';
        formAlerts.style.display = 'none';
    }

    function validateField(field, validationFn) {
        const errorMessage = validationFn();
        if (errorMessage) {
            displayError(field, errorMessage);
            return false;
        } else {
            clearError(field);
            return true;
        }
    }

    function checkAllFields(showErrors = false) {
        let allValid = true;
        const fieldsToValidate = [
            firstName, lastName, email, phone, password, confirmPassword, terms
        ];

        fieldsToValidate.forEach(field => {
            // Only show errors if explicitly requested (e.g., on submit)
            // or if the field has been touched (handled by real-time listeners, not here)
            // But here we need to return valid status.
            
            const validator = getValidator(field);
            const errorMessage = validator();
            
            if (errorMessage) {
                allValid = false;
                if (showErrors) {
                    displayError(field, errorMessage);
                }
            } else {
                if (showErrors) {
                    clearError(field);
                }
            }
        });

        // Specific checks
        const selectedGender = document.querySelector('input[name="gender"]:checked');
        if (!selectedGender) {
            allValid = false;
            if (showErrors) genderError.textContent = 'Please select a gender.';
        } else {
            if (showErrors) genderError.textContent = '';
        }

        if (country.value === "") {
            allValid = false;
            if (showErrors) countryError.textContent = 'Country is required.';
        } else {
            if (showErrors) countryError.textContent = '';
        }

        // Password strength (always update meter, but don't block unless required length failed above)
        const passwordValue = password.value;
        if (passwordValue.length > 0) {
            updatePasswordStrength(passwordValue);
        } else {
            passwordStrengthDiv.style.width = '0%';
            passwordTextSpan.textContent = '';
        }

        return allValid;
    }

    function updateSubmitButtonState() {
        // We do NOT want to disable the button dynamically based on validity 
        // because the user wants to see errors ONLY when they click register.
        // If we disable it, they can't click it to see the "Required" messages.
        // So we'll keep it enabled, or only disable it while processing.
        // submitBtn.disabled = !isFormValid; <-- REMOVE THIS LOGIC
        
        // However, if you really want real-time feedback (green checks etc), 
        // you can keep track of validity internally without showing errors.
    }

    // --- Validation Functions ---

    function getValidator(element) {
        switch (element.id) {
            case 'firstName': return () => element.value.trim() === '' ? 'First Name is required.' : '';
            case 'lastName': return () => element.value.trim() === '' ? 'Last Name is required.' : '';
            case 'email': return () => {
                const value = element.value.trim();
                if (value === '') return 'Email is required.';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address.';
                const domain = value.split('@')[1];
                if (disposableDomains.includes(domain)) return 'Disposable email addresses are not allowed.';
                return '';
            };
            case 'phone': return () => {
    const value = element.value.trim();
    if (value === '') return 'Phone number is required.';
    // Only validate numeric part, do not require country code in the number box
    if (!/^\d{6,16}$/.test(value.replace(/\s|\-/g, ''))) return 'Enter a valid phone number (numbers only, 6-16 digits).';
    return '';
};
            case 'age': return () => {
                const value = parseInt(element.value, 10);
                if (element.value !== '' && (isNaN(value) || value < 18)) return 'You must be at least 18 years old.';
                return '';
            };
            case 'password': return () => {
                const value = element.value;
                if (value === '') return 'Password is required.';
                // Password strength check is handled separately in updatePasswordStrength
                // but we can add basic length validation here if needed
                if (value.length < 6) return 'Password must be at least 6 characters long.';
                return '';
            };
            case 'confirmPassword': return () => {
                const value = element.value;
                if (value === '') return 'Please confirm your password.';
                if (value !== password.value) return 'Passwords do not match.';
                return '';
            };
            case 'terms': return () => element.checked ? '' : 'You must agree to the Terms & Conditions.';
            default: return () => ''; // For fields not needing specific client-side validation here
        }
    }

    function updatePasswordStrength(passwordValue) {
        let strength = 0;
        let passwordText = '';
        let className = '';

        if (passwordValue.length === 0) {
            strength = 0;
        } else {
            // Basic checks: length, uppercase, lowercase, numbers, special chars
            if (passwordValue.length >= 8) strength++;
            if (/[A-Z]/.test(passwordValue)) strength++;
            if (/[a-z]/.test(passwordValue)) strength++;
            if (/[0-9]/.test(passwordValue)) strength++;
            if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordValue)) strength++;

            switch (strength) {
                case 0:
                case 1:
                    passwordText = 'Weak';
                    className = 'strength-weak';
                    break;
                case 2:
                case 3:
                    passwordText = 'Medium';
                    className = 'strength-medium';
                    break;
                case 4:
                case 5:
                    passwordText = 'Strong';
                    className = 'strength-strong';
                    break;
            }
        }

        passwordStrengthDiv.style.width = `${(strength / 5) * 100}%`;
        passwordTextSpan.textContent = passwordText;
        passwordStrengthDiv.className = className; // Apply strength class
        password.closest('.form-group').className = `form-group ${className}`; // Apply to form group for overall styling
    }

    // --- Location Data (Simulated) ---
    // All major countries, some with example states/cities
    const locationData = {
    US: { countryCode: "+1", states: {
        CA: { name: "California", cities: ["Los Angeles", "San Francisco", "San Diego", "Sacramento", "San Jose", "Fresno", "Long Beach"] },
        TX: { name: "Texas", cities: ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth", "El Paso", "Arlington", "Corpus Christi"] },
        NY: { name: "New York", cities: ["New York City", "Buffalo", "Albany", "Rochester", "Syracuse", "Yonkers", "Utica"] },
        FL: { name: "Florida", cities: ["Miami", "Orlando", "Tampa", "Jacksonville", "Tallahassee"] },
        IL: { name: "Illinois", cities: ["Chicago", "Aurora", "Naperville", "Springfield"] },
        PA: { name: "Pennsylvania", cities: ["Philadelphia", "Pittsburgh", "Allentown"] },
        OH: { name: "Ohio", cities: ["Columbus", "Cleveland", "Cincinnati"] }
    } },
    IN: { countryCode: "+91", states: {
        AP: { name: "Andhra Pradesh", cities: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Kakinada", "Rajahmundry"] },
        TG: { name: "Telangana", cities: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam", "Mahbubnagar"] },
        MH: { name: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur"] },
        DL: { name: "Delhi", cities: ["New Delhi", "Delhi Cantonment"] },
        KA: { name: "Karnataka", cities: ["Bengaluru", "Mysuru", "Mangalore", "Hubli"] },
        GJ: { name: "Gujarat", cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"] },
        TN: { name: "Tamil Nadu", cities: ["Chennai", "Coimbatore", "Madurai", "Salem"] },
        UP: { name: "Uttar Pradesh", cities: ["Lucknow", "Kanpur", "Ghaziabad", "Agra"] },
        RJ: { name: "Rajasthan", cities: ["Jaipur", "Jodhpur", "Udaipur", "Ajmer"] },
        WB: { name: "West Bengal", cities: ["Kolkata", "Howrah", "Durgapur", "Siliguri"] },
        MP: { name: "Madhya Pradesh", cities: ["Bhopal", "Indore", "Gwalior", "Jabalpur"] }
    } },
    GB: { countryCode: "+44", states: {
        ENG: { name: "England", cities: ["London", "Manchester", "Birmingham", "Leeds", "Liverpool", "Sheffield", "Bristol", "Nottingham", "Leicester", "Southampton"] },
        SCT: { name: "Scotland", cities: ["Edinburgh", "Glasgow", "Aberdeen", "Dundee", "Inverness"] },
        WLS: { name: "Wales", cities: ["Cardiff", "Swansea", "Newport", "Wrexham"] },
        NIR: { name: "Northern Ireland", cities: ["Belfast", "Derry", "Lisburn", "Newry"] }
    } },
        CA: { countryCode: "+1", states: {} },
        AU: { countryCode: "+61", states: {} },
        DE: { countryCode: "+49", states: {} },
        FR: { countryCode: "+33", states: {} },
        IT: { countryCode: "+39", states: {} },
        ES: { countryCode: "+34", states: {} },
        JP: { countryCode: "+81", states: {} },
        CN: { countryCode: "+86", states: {} },
        BR: { countryCode: "+55", states: {} },
        ZA: { countryCode: "+27", states: {} },
        SA: { countryCode: "+966", states: {} },
        RU: { countryCode: "+7", states: {} },
        SG: { countryCode: "+65", states: {} },
        MX: { countryCode: "+52", states: {} },
        TR: { countryCode: "+90", states: {} },
        AE: { countryCode: "+971", states: {} },
        SE: { countryCode: "+46", states: {} },
        NL: { countryCode: "+31", states: {} },
        CH: { countryCode: "+41", states: {} },
        KR: { countryCode: "+82", states: {} },
        NZ: { countryCode: "+64", states: {} },
        AR: { countryCode: "+54", states: {} },
        EG: { countryCode: "+20", states: {} },
        PK: { countryCode: "+92", states: {} }
        // ... expand for more if desired
    };


    function populateDropdown(element, options) {
        element.innerHTML = '<option value="">Select</option>'; // Clear existing options
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.text;
            element.appendChild(opt);
        });
    }

    function getCountryCode(countryKey) {
        return locationData[countryKey]?.countryCode || defaultCountryCodes[countryKey] || null;
    }
    // World country phone codes (cover the allCountries array; add as needed)
    const defaultCountryCodes = {
        US: '+1', IN: '+91', GB: '+44', CA: '+1', AU: '+61', DE: '+49', FR: '+33', IT: '+39', ES: '+34', JP: '+81',
        CN: '+86', BR: '+55', ZA: '+27', SA: '+966', RU: '+7', SG: '+65', MX: '+52', TR: '+90', AE: '+971', SE: '+46',
        NL: '+31', CH: '+41', KR: '+82', NZ: '+64', AR: '+54', EG: '+20', PK: '+92'
    };

    // --- Country list (ISO Code + Name) ---
    const allCountries = [
        { code: 'US', name: 'United States' }, { code: 'IN', name: 'India' }, { code: 'GB', name: 'United Kingdom' },
        { code: 'CA', name: 'Canada' }, { code: 'AU', name: 'Australia' }, { code: 'DE', name: 'Germany' },
        { code: 'FR', name: 'France' }, { code: 'IT', name: 'Italy' }, { code: 'ES', name: 'Spain' },
        { code: 'JP', name: 'Japan' }, { code: 'CN', name: 'China' }, { code: 'BR', name: 'Brazil' },
        { code: 'ZA', name: 'South Africa' }, { code: 'SA', name: 'Saudi Arabia' }, { code: 'RU', name: 'Russia' },
        { code: 'SG', name: 'Singapore' }, { code: 'MX', name: 'Mexico' }, { code: 'TR', name: 'Turkey' },
        { code: 'AE', name: 'United Arab Emirates' }, { code: 'SE', name: 'Sweden' }, { code: 'NL', name: 'Netherlands' },
        { code: 'CH', name: 'Switzerland' }, { code: 'KR', name: 'South Korea' }, { code: 'NZ', name: 'New Zealand' },
        { code: 'AR', name: 'Argentina' }, { code: 'EG', name: 'Egypt' }, { code: 'PK', name: 'Pakistan' }
        //... add more as needed
    ];

    function populateCountries() {
        const countryOptions = allCountries.map(c => ({ value: c.code, text: c.name }));
        populateDropdown(country, countryOptions);
    }

    function populateStates() {
        const selectedCountry = country.value;
        // Minimal example: you need to expand for the full world
        const states = locationData[selectedCountry] ?
            Object.keys(locationData[selectedCountry].states).map(key => ({
                value: key,
                text: locationData[selectedCountry].states[key].name || key
            })) : [];
        populateDropdown(state, states);
        state.disabled = states.length === 0;
        if(states.length === 0) clearError(state); // Clear state error if disabled
        populateCities(); // Clear cities when state changes
        updateCountryCodeField(selectedCountry);
    }

    function populateCities() {
        const selectedCountry = country.value;
        const selectedState = state.value;
        const cities = locationData[selectedCountry]?.states[selectedState]?.cities.map(city => ({
            value: city.toLowerCase().replace(/\s+/g, '-'), // Create slug-like values
            text: city
        })) || [];

        populateDropdown(city, cities);
        city.disabled = cities.length === 0;
         if(cities.length === 0) clearError(city); // Clear city error if disabled
    }

    // --- Event Listeners ---

    // Form Submission
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        hideFormAlert(); // Clear previous alerts

        // Mark all fields as touched so errors will show after submit
        inputFields.forEach(field => touched[field.id] = true);
        
        // Force validation of all fields and SHOW ERRORS now
        const allValid = checkAllFields(true); 

        if (allValid) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';
            // Success popup
            setTimeout(() => {
                const success = Math.random() > 0.1; // 90% success rate for simulation
                if (success) {
                    showPopup('✅ Registration Successful!', 'Your profile has been submitted successfully.');
                    form.reset(); // Clear the form
                    // Reset dropdowns and password strength meter
                    state.disabled = true;
                    city.disabled = true;
                    passwordStrengthDiv.style.width = '0%';
                    passwordTextSpan.textContent = '';
                    passwordStrengthDiv.className = '';
                    password.closest('.form-group').className = 'form-group';
                    updateSubmitButtonState();
                } else {
                    showPopup('❌ Registration Failed', 'Please try again later.');
                    submitBtn.textContent = 'Register';
                    submitBtn.disabled = false;
                }
            }, 1500);
        }
    });

    // ---- Popup Dialog
    function showPopup(title, message) {
        let popup = document.createElement('div');
        popup.className = 'popup-overlay';
        popup.innerHTML = `<div class='popup-dialog'><h2>${title}</h2><div class='popup-body'>${message}</div><button class='popup-ok'>OK</button></div>`;
        document.body.appendChild(popup);
        setTimeout(() => popup.classList.add('active'), 30);
        popup.querySelector('.popup-ok').onclick = () => {
            popup.classList.remove('active');
            setTimeout(() => popup.remove(), 500);
        };
    }

    // --- Real-time Validations (on blur and input) ---
    // Only validate live after the user interacts (so errors don't show at first)
    const inputFields = [firstName, lastName, email, phone, age, password, confirmPassword];
    const touched = {};
    inputFields.forEach(field => {
        touched[field.id] = false;
        field.addEventListener('input', () => {
            if (touched[field.id]) {
                validateField(field, getValidator(field));
            }
            updateSubmitButtonState();
        });
        field.addEventListener('blur', () => {
            touched[field.id] = true;
            validateField(field, getValidator(field));
            updateSubmitButtonState();
        });
    });

    // Radio buttons (Gender)
    const genderRadios = document.querySelectorAll('input[name="gender"]');
    genderRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (document.querySelector('input[name="gender"]:checked')) {
                clearError(document.querySelector('input[name="gender"]')); // Clear error for the group
            }
            updateSubmitButtonState();
        });
    });

    // Dropdowns
    country.addEventListener('change', () => {
        // Only validate if user has interacted (change event implies interaction)
        validateField(country, getValidator(country)); 
        populateStates();
        updateCountryCodeField(country.value);
        updateSubmitButtonState();
    });

    function updateCountryCodeField(countryCodeVal) {
        const code = getCountryCode(countryCodeVal);
        countryCode.value = code ? code : '';
    }

    state.addEventListener('change', () => {
        validateField(state, getValidator(state)); 
        populateCities();
        updateSubmitButtonState();
    });

    city.addEventListener('change', () => {
        validateField(city, getValidator(city)); 
        updateSubmitButtonState();
    });

    // Password Strength Meter
    password.addEventListener('input', () => {
        const currentValue = password.value;
        // Don't show error immediately on input unless touched
        if (touched[password.id]) {
             validateField(password, getValidator(password));
        }
        updatePasswordStrength(currentValue);
        updateSubmitButtonState(); 
    });

    // Confirm Password
    confirmPassword.addEventListener('input', () => {
        if (touched[confirmPassword.id]) {
            validateField(confirmPassword, getValidator(confirmPassword));
        }
        updateSubmitButtonState();
    });

    // Terms & Conditions
    terms.addEventListener('change', () => {
        validateField(terms, getValidator(terms));
        updateSubmitButtonState();
    });

    // Initial Setup
    populateCountries();
    // Do NOT call updateSubmitButtonState() here to avoid triggering validations
    // Just ensure button starts disabled if that's the desired initial state (which is default in HTML)
    submitBtn.disabled = false; // Let user click to see errors, OR keep disabled but don't show errors yet.
    // Standard practice: Button enabled so user can click and see validation errors. 
    // OR: Button disabled, but NO errors shown.
    
    // The user specifically asked: "it only needs to be appear when the user hit register"
    // So we should NOT validate on load.
    
    // We'll leave the button enabled or handle the disabled state without running checkAllFields() visually.
    // If we want the button disabled initially without showing errors:
    submitBtn.disabled = false; // Let them click it to trigger the "required" messages.

    // Handle Terms & Conditions Link (Optional: open a modal or navigate)
    termsLink.addEventListener('click', (e) => {
        e.preventDefault();
        // In a real app, you'd open a modal here.
        alert('Displaying Terms & Conditions...');
    });
});