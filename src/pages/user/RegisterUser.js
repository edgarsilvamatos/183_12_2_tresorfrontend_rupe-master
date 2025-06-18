import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { postUser } from "../../comunication/FetchUser";

/**
 * RegisterUser
 * @author Peter Rutschmann
 */
function PasswordStrengthIndicator({ password }) {
    const calculateStrength = (password) => {
        if (!password) return 0;
        
        let strength = 0;
        
        // Length check
        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;
        
        // Character type checks
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[@$!%*?&]/.test(password)) strength += 1;
        
        return Math.min(strength, 6);
    };

    const getStrengthColor = (strength) => {
        const colors = ['#ff4444', '#ffbb33', '#ffeb3b', '#00C851', '#33b5e5', '#2BBBAD'];
        return colors[strength - 1] || '#ff4444';
    };

    const getStrengthText = (strength) => {
        const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
        return texts[strength - 1] || 'Very Weak';
    };

    const strength = calculateStrength(password);
    const color = getStrengthColor(strength);
    const text = getStrengthText(strength);

    return (
        <div style={{ marginTop: '5px' }}>
            <div style={{ 
                height: '5px', 
                backgroundColor: '#e0e0e0', 
                borderRadius: '2px',
                marginBottom: '5px'
            }}>
                <div style={{
                    height: '100%',
                    width: `${(strength / 6) * 100}%`,
                    backgroundColor: color,
                    borderRadius: '2px',
                    transition: 'width 0.3s ease-in-out'
                }} />
            </div>
            <small style={{ color: color }}>{text}</small>
        </div>
    );
}

function RegisterUser({loginValues, setLoginValues}) {
    const navigate = useNavigate();
    const recaptchaRef = useRef(null);

    const initialState = {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        passwordConfirmation: "",
        recaptchaToken: "",
        errorMessage: ""
    };
    const [credentials, setCredentials] = useState(initialState);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsSubmitting(true);

        try {
            // Validate passwords match
            if (credentials.password !== credentials.passwordConfirmation) {
                setErrorMessage('Password and password-confirmation are not equal.');
                return;
            }

            // Validate password strength
            const passwordErrors = validatePassword(credentials.password);
            if (passwordErrors.length > 0) {
                setErrorMessage(passwordErrors.join('\n'));
                return;
            }

            // Validate ReCAPTCHA
            if (!credentials.recaptchaToken) {
                setErrorMessage('Please complete the ReCAPTCHA verification.');
                return;
            }

            console.log("Submitting registration with ReCAPTCHA token:", credentials.recaptchaToken ? "Token present" : "No token");
            
            await postUser(credentials);
            setLoginValues({userName: credentials.email, password: credentials.password});
            setCredentials(initialState);
            if (recaptchaRef.current) {
                recaptchaRef.current.reset();
            }
            navigate('/');
        } catch (error) {
            console.error('Registration failed:', error);
            setErrorMessage(error.message || 'Registration failed. Please try again.');
            if (recaptchaRef.current) {
                recaptchaRef.current.reset();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h2>Register user</h2>
            <form onSubmit={handleSubmit}>
                <section>
                    <aside>
                        <div>
                            <label>Firstname:</label>
                            <input
                                type="text"
                                value={credentials.firstName}
                                onChange={(e) =>
                                    setCredentials(prevValues => ({...prevValues, firstName: e.target.value}))}
                                required
                                placeholder="Please enter your firstname *"
                            />
                        </div>
                        <div>
                            <label>Lastname:</label>
                            <input
                                type="text"
                                value={credentials.lastName}
                                onChange={(e) =>
                                    setCredentials(prevValues => ({...prevValues, lastName: e.target.value}))}
                                required
                                placeholder="Please enter your lastname *"
                            />
                        </div>
                        <div>
                            <label>Email:</label>
                            <input
                                type="email"
                                value={credentials.email}
                                onChange={(e) =>
                                    setCredentials(prevValues => ({...prevValues, email: e.target.value}))}
                                required
                                placeholder="Please enter your email"
                            />
                        </div>
                    </aside>
                    <aside>
                        <div>
                            <label>Password:</label>
                            <input
                                type="password"
                                value={credentials.password}
                                onChange={(e) =>
                                    setCredentials(prevValues => ({...prevValues, password: e.target.value}))}
                                required
                                placeholder="Please enter your password *"
                            />
                            <PasswordStrengthIndicator password={credentials.password} />
                        </div>
                        <div>
                            <label>Password confirmation:</label>
                            <input
                                type="password"
                                value={credentials.passwordConfirmation}
                                onChange={(e) =>
                                    setCredentials(prevValues => ({...prevValues, passwordConfirmation: e.target.value}))}
                                required
                                placeholder="Please confirm your password *"
                            />
                        </div>
                        <div style={{ marginTop: '20px' }}>
                            <ReCAPTCHA
                                ref={recaptchaRef}
                                sitekey="6LenF1QrAAAAAIe8FrD6CmDntrs-MDc1yDKViVr6"
                                onChange={handleRecaptchaChange}
                                onExpired={handleRecaptchaExpired}
                                onError={handleRecaptchaError}
                            />
                        </div>
                    </aside>
                </section>
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Registering...' : 'Register'}
                </button>
                {errorMessage && (
                    <div style={{ 
                        color: 'red', 
                        whiteSpace: 'pre-line', 
                        marginTop: '10px',
                        padding: '10px',
                        backgroundColor: '#ffebee',
                        borderRadius: '4px'
                    }}>
                        {errorMessage}
                    </div>
                )}
            </form>
        </div>
    );
}

export default RegisterUser;
