import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

/**
 * LoginUser
 * @author Peter Rutschmann
 */
function LoginUser({loginValues, setLoginValues}) {
    const [recaptchaToken, setRecaptchaToken] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!recaptchaToken) {
        setErrorMessage('Please verify the captcha.');
        return;
        }
        console.log(loginValues);
        navigate('/');
    };

    return (
        <div>
            <h2>Login user</h2>
            <form onSubmit={handleSubmit}>
                <section>
                    <aside>
                        <div>
                            <label>Email:</label>
                            <input
                                type="text"
                                value={loginValues.email}
                                onChange={(e) =>
                                    setLoginValues(prevValues => ({...prevValues, email: e.target.value}))}
                                required
                                placeholder="Please enter your email *"
                            />
                        </div>
                        <div>
                            <label>Password:</label>
                            <input
                                type="text"
                                value={loginValues.password}
                                onChange={(e) =>
                                    setLoginValues(prevValues => ({...prevValues, password: e.target.value}))}
                                required
                                placeholder="Please enter your password *"
                            />
                        </div>
                    </aside>
                </section>

                <ReCAPTCHA
                    sitekey="6LenF1QrAAAAAIe8FrD6CmDntrs-MDc1yDKViVr6"
                    onChange={token => setRecaptchaToken(token || '')}
                    required
                />

                <button type="submit">Login</button>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

            </form>
        </div>
    );
}

export default LoginUser;