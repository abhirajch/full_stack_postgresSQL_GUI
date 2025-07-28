import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardTitle,
  CRow,
  CCol
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../baseURL'

const Dashboard = () => {
  const [databases, setDatabases] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        const res = await axiosInstance.get('/databases') // token handled automatically
        setDatabases(res.data)
      } catch (err) {
        console.error('Error fetching databases', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDatabases()
  }, [])

  const handleAddDatabase = () => {
    navigate('/create-database')
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center">
        <h2>Your Databases</h2>
        <CButton color="primary" onClick={handleAddDatabase}>+ Create Database</CButton>
      </div>

      <CRow className="mt-4">
        {databases.length === 0 ? (
          <CCol xs={12} className="text-center">
            <p>No databases created yet.</p>
          </CCol>
        ) : (
          databases.map((db) => (
            <CCol md={4} key={db.id} className="mb-3">
              <CCard onClick={() =>
                navigate('/database-table', {
                  state: { db }
                })
              } style={{ cursor: 'pointer' }}>
                <CCardBody>
                  <CCardTitle>📁{db.db_name}</CCardTitle>
                </CCardBody>
              </CCard>
            </CCol>
          ))
        )}
      </CRow>
    </div>
  )
}

export default Dashboard
