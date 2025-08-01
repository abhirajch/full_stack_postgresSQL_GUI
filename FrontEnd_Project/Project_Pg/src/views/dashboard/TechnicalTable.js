import React, { useEffect, useState } from 'react'
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
import { useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../baseURL'

const DatabaseTables = () => {
    const [tables, setTables] = useState([])
    const [visible, setVisible] = useState(false)
    const [query, setQuery] = useState('')
    const navigate = useNavigate();
    const location = useLocation();
    const dbName = location.state.dbname
    console.log(dbName)
    const fetchTables = async () => {
        try {
            const res = await axiosInstance.get(`/databasql/tablesses/${dbName}`)
            setTables(res.data.tables)
        } catch (err) {
            console.error('Error fetching tables:', err)
            alert('Failed to fetch tables')
        }
    }
    useEffect(() => {
        if (!dbName) return
        fetchTables()
    }, [dbName])

    const handleCreateTable = async () => {
        try {
            const res = await axiosInstance.post('/sql/execute/table', {
                query,
                database: dbName,
            })

            alert('Table created successfully')
            setVisible(false)
            setQuery('')
            fetchTables();
            // fetchTables() // Uncomment if needed
        } catch (err) {
            console.error(err)
            if (err.response) {
                alert(err.response.data.error || 'Failed to create table')
                if (err.response.status === 403) {
                    alert('Unauthorized action. Please login again.')
                }
            } else {
                alert('Server error')
            }
        }
    }
    return (
        <CContainer className="mt-5">
            <CRow className="justify-content-center">
                <CCol md={10}>
                    <CCard>
                        <CCardHeader className="d-flex justify-content-between align-items-center">
                            <h5>Tables in: {dbName}</h5>
                            <CButton color="primary" onClick={() => setVisible(true)}>
                                + Create Table
                            </CButton>
                        </CCardHeader>
                        <CCardBody>
                            <CListGroup>
                                {tables.map((table, index) => (
                                    <CListGroupItem
                                        key={index}
                                        onClick={() => navigate('/table-view', { state: { dbname: dbName, tablename: table } })}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        🧾 {table}
                                    </CListGroupItem>
                                ))}
                            </CListGroup>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
            <CModal visible={visible} onClose={() => setVisible(false)}>
                <CModalHeader onClose={() => setVisible(false)}>
                    <CModalTitle>Create New Table in {dbName}</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CFormTextarea
                        rows={6}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={`CREATE TABLE example (id SERIAL PRIMARY KEY, name TEXT);`}
                    />
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setVisible(false)}>
                        Cancel
                    </CButton>
                    <CButton color="primary" onClick={handleCreateTable}>
                        Create
                    </CButton>
                </CModalFooter>
            </CModal>
        </CContainer>
    )
}

export default DatabaseTables
