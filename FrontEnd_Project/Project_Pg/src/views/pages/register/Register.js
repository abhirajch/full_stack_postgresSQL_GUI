import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { useNavigate, Link } from 'react-router-dom'
import axiosInstance from '../../../baseURL';

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [type, setType] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

const handleRegister = async (e) => {
  e.preventDefault()

  if (password !== repeatPassword) {
    return setError("Passwords don't match")
  }

  try {
    const res = await axiosInstance.post('/api/auth/register', {
      email,
      password,
      type,
    })

    if (res.status === 200 || res.status === 201) {
      alert('Registration successful! Please login.')
      navigate('/login')
    }
  } catch (err) {
    console.error(err)
    if (err.response && err.response.data?.error) {
      setError(err.response.data.error)
    } else {
      setError('Server error. Try again later.')
    }
  }
}


  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm onSubmit={handleRegister}>
                  <h1>Register</h1>
                  <p className="text-body-secondary">Create your account</p>

                  {error && <p style={{ color: 'red' }}>{error}</p>}

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="username"
                      required
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-4">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Repeat password"
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>User Type</CInputGroupText>
                    <select
                      className="form-control"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Technical">Technical</option>
                      <option value="Non-Technical">Non-Technical</option>
                    </select>
                  </CInputGroup>

                  <div className="d-grid mb-2">
                    <CButton color="success" type="submit">
                      Create Account
                    </CButton>
                  </div>

                  <div className="text-center">
                    Already have an account?{' '}
                    <Link to="/login">Login here</Link>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Register
