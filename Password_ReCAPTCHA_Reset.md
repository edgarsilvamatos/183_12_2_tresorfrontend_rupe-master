# Password
## In RegisterUser.js

Benutzung von RegeX

```JavaScript  
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
```

Und Testing

```JavaScript
    if (!passwordRegex.test(credentials.password)) {
        setErrorMessage('Password too weak.');
        return;
    }
```

## In User.java

Hinzufügen vom selben

```Java
   @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
            message = "Password too weak!")
   @Column(nullable = false)
   private String password;
```

# ReCAPTCHA
## In LoginUser.js

```JavaScript
    import ReCAPTCHA from 'react-google-recaptcha';
    ...

    if (!recaptchaToken) {
    setErrorMessage('Please verify the captcha.');
    return;
    }
```

Und die implementierung im HTML:

```TSX
    <ReCAPTCHA
        sitekey="..."
        onChange={token => setRecaptchaToken(token || '')}
        required
    />
```

Die Abfangung im Backend:

```Java
// === ReCaptcha Verification ===
      String recaptchaToken = registerUser.getRecaptchaToken();
      String secretKey = "6LenF1QrAAAAAIe8FrD6CmDntrs-MDc1yDKViVr6"; 

      RestTemplate restTemplate = new RestTemplate();
      String verifyUrl = "https://www.google.com/recaptcha/api/siteverify";

      Map<String, String> body = new HashMap<>();
      body.put("secret", secretKey);
      body.put("response", recaptchaToken);

      HttpEntity<Map<String, String>> request = new HttpEntity<>(body);
      ResponseEntity<String> captchaResponse = restTemplate.postForEntity(verifyUrl, request, String.class);

      if (!captchaResponse.getBody().contains("\"success\": true")) {
         return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("{\"message\":\"Captcha validation failed\"}");
      }
```

# Reset Password
## In Usercontroller.java

Neue Funktion:

```Java
   @CrossOrigin(origins = "${CROSS_ORIGIN}")
   @PutMapping("/reset-password")
   public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> payload) {
      String email = payload.get("email");
      String newPassword = payload.get("newPassword");

      if (email == null || newPassword == null) {
         return ResponseEntity.badRequest().body("{\"message\":\"Email and new password required\"}");
      }

      User user = userService.findByEmail(email);
      if (user == null) {
         return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"message\":\"User not found\"}");
      }

      user.setPassword(passwordService.hashPassword(newPassword));
      userService.updateUser(user);

      return ResponseEntity.ok("{\"message\":\"Password reset successful\"}");
   }
```