import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CFormTextarea,
  CListGroup,
  CListGroupItem,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CRow,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../baseURL' // <-- make sure the path is correct

const TechnicalDashboard = () => {
  const [visible, setVisible] = useState(false)
  const [query, setQuery] = useState('')
  const [databases, setDatabases] = useState([])
  const navigate = useNavigate()

  // Fetch databases from backend
  const fetchDatabases = async () => {
    try {
      const res = await axiosInstance.get('/sql/databases')
      setDatabases(res.data.rows)
    } catch (error) {
      console.error('Error fetching databases:', error)
    }
  }

  useEffect(() => {
    fetchDatabases()
  }, [])

  // Create database
  const handleCreateDatabase = async () => {
    try {
      const res = await axiosInstance.post('/sql/execute', {
        query: query,
      })

      if (res.status === 200) {
        alert('Database created successfully')
        fetchDatabases()
        setVisible(false)
        setQuery('')
      } else {
        alert(res.data.error || 'Failed to create database')
      }
    } catch (err) {
      console.error(err)
      alert('Server error')
    }
  }

  return (
    <CContainer className="mt-5">
      <CRow className="justify-content-center">
        <CCol md={10}>
          <CCard>
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <h5>Technical Dashboard</h5>
              <CButton color="primary" onClick={() => setVisible(true)}>
                + Add Dashboard
              </CButton>
            </CCardHeader>

            <CCardBody>
              <h6 className="mb-3">Databases</h6>
              <CListGroup>
                {databases.map((db) => (
                  <CListGroupItem
                    key={db.datname}
                    component="button"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/technical-table`,
                        {
                            state : {dbname : db.datname}
                        }
                    )}
                  >
                    📁 {db.datname}
                  </CListGroupItem>
                ))}
              </CListGroup>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader onClose={() => setVisible(false)}>
          <CModalTitle>Create New Database</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormTextarea
            rows={4}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="CREATE DATABASE my_database;"
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleCreateDatabase}>
            Create
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default TechnicalDashboard
