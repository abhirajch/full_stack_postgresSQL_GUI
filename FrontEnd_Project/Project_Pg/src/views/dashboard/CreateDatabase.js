import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CButton,
  CAlert
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../baseURL' 

const CreateDatabase = () => {
  const [dbName, setDbName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const response = await axiosInstance.post('/databases', {
        db_name: dbName
      })
      if (response.status === 200 || response.status === 201) {
        setSuccess('Database created successfully!')
        setDbName('')
        setTimeout(() => navigate('/dashboard'), 1500)
      } else {
        setError('Something went wrong.')
      }
    } catch (err) {
      console.error(err)
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error)
      } else {
        setError('Server error. Please try again.')
      }
    }
  }

  return (
    <CCard className="mx-auto mt-5" style={{ maxWidth: '500px' }}>
      <CCardHeader>Create New Database</CCardHeader>
      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          <CFormInput
            type="text"
            label="Database Name"
            value={dbName}
            onChange={(e) => setDbName(e.target.value)}
            required
          />
          <div className="mt-3">
            <CButton type="submit" color="primary">Create</CButton>
          </div>
        </CForm>
        {success && <CAlert color="success" className="mt-3">{success}</CAlert>}
        {error && <CAlert color="danger" className="mt-3">{error}</CAlert>}
      </CCardBody>
    </CCard>
  )
}

export default CreateDatabase
