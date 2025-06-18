# Password
## In RegisterUser.js

Benutzung von RegeX

```JavaScript  
    const validatePassword = (password) => {
        const errors = [];
        
        if (password.length < 8) {
            errors.push("Password must be at least 8 characters long");
        }
        
        if (password.length > 128) {
            errors.push("Password must not exceed 128 characters");
        }
        
        if (!/[A-Z]/.test(password)) {
            errors.push("Password must contain at least one uppercase letter");
        }
        
        if (!/[a-z]/.test(password)) {
            errors.push("Password must contain at least one lowercase letter");
        }
        
        if (!/[0-9]/.test(password)) {
            errors.push("Password must contain at least one number");
        }
        
        if (!/[@$!%*?&+]/.test(password)) {
            errors.push("Password must contain at least one special character (@$!%*?&)");
        }
        
        return errors;
    };
```

Und Testing

```JavaScript
    // Validate password strength
    const passwordErrors = validatePassword(credentials.password);
    if (passwordErrors.length > 0) {
        setErrorMessage(passwordErrors.join('\n'));
        return;
    }
```

## In PasswordValidator.java

Hinzufügen vom selben

```Java
private static final String PASSWORD_PATTERN = 
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&+])[A-Za-z\\d@$!%*?&]{8,}$";
    
    private static final Pattern pattern = Pattern.compile(PASSWORD_PATTERN);
    
    public List<String> validatePassword(String password) {
        List<String> errors = new ArrayList<>();
        
        if (password == null || password.length() < 8) {
            errors.add("Password must be at least 8 characters long");
        }
        
        if (password != null && password.length() > 128) {
            errors.add("Password must not exceed 128 characters");
        }

        ...
```

# ReCAPTCHA
## In RegisterUser.js

```JavaScript
    import ReCAPTCHA from 'react-google-recaptcha';
    ...

    const handleRecaptchaChange = (token) => {
        console.log("ReCAPTCHA token received:", token ? "Token present" : "No token");
        setCredentials(prevValues => ({ ...prevValues, recaptchaToken: token }));
    };

    const handleRecaptchaExpired = () => {
        console.log("ReCAPTCHA expired");
        setCredentials(prevValues => ({ ...prevValues, recaptchaToken: "" }));
        setErrorMessage("ReCAPTCHA verification expired. Please verify again.");
    };

    const handleRecaptchaError = () => {
        console.log("ReCAPTCHA error occurred");
        setCredentials(prevValues => ({ ...prevValues, recaptchaToken: "" }));
        setErrorMessage("ReCAPTCHA verification failed. Please try again.");
    };
```

Und die implementierung im HTML:

```TSX
    <ReCAPTCHA
        ref={recaptchaRef}
        sitekey="-------------------------------MDc1yDKViVr6"
        onChange={handleRecaptchaChange}
        onExpired={handleRecaptchaExpired}
        onError={handleRecaptchaError}
    />
```

## In RecaptchaService.java

Die Abfangung im Backend:

```Java
// Hardcoded ReCAPTCHA keys
    private static final String SECRET_KEY = "-----------------U4bZIOrlGdf9PX";
    private static final String RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

    // Define timeouts in milliseconds
    private static final int CONNECT_TIMEOUT_MS = 5000; // 5 seconds
    private static final int READ_TIMEOUT_MS = 10000;  // 10 seconds
    
    @PostConstruct
    public void init() {
        logger.info("Initializing ReCAPTCHA service with secret key: {}****{}", 
            SECRET_KEY.substring(0, 2), 
            SECRET_KEY.substring(SECRET_KEY.length() - 2));
    }
    
    public boolean verifyRecaptcha(String recaptchaResponse) {
        ...
            // Make the request
            Map<String, Object> response = restTemplate.postForObject(
                RECAPTCHA_VERIFY_URL,
                request,
                Map.class
            );
        ...
```

## In UserController.java

Benutzung bei HTTP Requests

```Java
   @CrossOrigin(origins = "${CROSS_ORIGIN}")
   @PostMapping
   public ResponseEntity<String> createUser(@Valid @RequestBody RegisterUser registerUser, BindingResult bindingResult) {
      // ReCAPTCHA verification
      if (!recaptchaService.verifyRecaptcha(registerUser.getRecaptchaToken())) {
         logger.warn("ReCAPTCHA verification failed for registration attempt");
         JsonObject obj = new JsonObject();
         JsonArray arr = new JsonArray();
         arr.add("ReCAPTCHA verification failed");
         obj.add("message", arr);
         return ResponseEntity.badRequest().body(new Gson().toJson(obj));
      }
      logger.info("ReCAPTCHA verification passed");
```