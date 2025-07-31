import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
  CAlert,
  CSpinner,
} from '@coreui/react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../../baseURL'; // ✅ Import your custom axios instance

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('type');
  }, []);
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      const res = await axiosInstance.post('/login', {
        email,
        password,
      });

      const data = res.data;
      console.log(data)
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('type', data.user.type);

        console.log(data.user.type);

        if (data.user.type === 'Non-Technical') {
          navigate('/dashboard');
        } else {
          navigate('/technical-dashboard');
        }
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login Error:', err);
      setError(
        err.response?.data?.error || 'Server error. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleLogin}>
                    <h1>Login</h1>
                    <p className="text-medium-emphasis">Sign in to your account</p>

                    {error && <CAlert color="danger">{error}</CAlert>}

                    <div className="mb-3">
                      <CFormLabel htmlFor="email">Email or Username</CFormLabel>
                      <CFormInput
                        type="text"
                        id="email"
                        placeholder="Enter your email or username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <CFormLabel htmlFor="password">Password</CFormLabel>
                      <CFormInput
                        type="password"
                        id="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <CRow>
                      <CCol xs={6}>
                        <CButton color="primary" type="submit" className="px-4" disabled={loading}>
                          {loading ? <CSpinner size="sm" /> : 'Login'}
                        </CButton>
                      </CCol>
                    </CRow>

                    <div className="text-center mt-3">
                      <span>Don't have an account? </span>
                      <Link to="/register">Register here</Link>
                    </div>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default Login;
