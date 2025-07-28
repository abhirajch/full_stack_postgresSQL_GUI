import React, { useEffect, useState } from 'react'
import {
    CCard,
    CCardBody,
    CCardHeader,
    CButton,
    CContainer,
    CTable,
    CTableBody,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
    CTableDataCell,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CFormTextarea,
} from '@coreui/react'
import { useLocation } from 'react-router-dom'
import axiosInstance from '../../baseURL'

const TableView = () => {
    const location = useLocation()
    const { dbname, tablename } = location.state
    const [records, setRecords] = useState([])
    const [columns, setColumns] = useState([])
    const [visible, setVisible] = useState(false)
    const [query, setQuery] = useState('')
    const fetchTableData = async () => {
        try {
            const res = await axiosInstance.get(`/${dbname}/${tablename}/rows`, {
                params: { dbname },
            })

            if (res.data.length > 0) {
                setColumns(Object.keys(res.data[0]))
                setRecords(res.data.slice(1))
            }
        } catch (err) {
            console.error('Failed to fetch table data', err)
            alert('Error loading table data')
        }
    }
    useEffect(() => {
        fetchTableData()
    }, [])
    const handleRunQuery = async () => {
        try {
            const res = await axiosInstance.post(`/execute-sql`, {
                sql: query,
                dbname,
            });
            alert(res.data.message || 'Query executed');
            setVisible(false);
            fetchTableData(); 
        } catch (err) {
            console.error('Insert failed', err);
            alert('Query failed: ' + err.response?.data?.error || err.message);
        }
    };
    return (
        <CContainer className="mt-5">
            <CCard>
                <CCardHeader className="d-flex justify-content-between align-items-center">
                    <h5>Table: {tablename}</h5>
                    <CButton color="info" onClick={() => setVisible(true)}>
                        Run SQL Query
                    </CButton>
                </CCardHeader>
                <CCardBody>
                    <CTable striped hover>
                        <CTableHead>
                            <CTableRow>
                                {columns.map((col, i) => (
                                    <CTableHeaderCell key={i}>{col}</CTableHeaderCell>
                                ))}
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {records.map((row, index) => (
                                <CTableRow key={index}>
                                    {columns.map((col) => (
                                        <CTableDataCell key={col}>
                                            {
                                                row[col]
                                            }
                                        </CTableDataCell>
                                    ))}
                                </CTableRow>
                            ))}
                        </CTableBody>
                    </CTable>
                </CCardBody>
            </CCard>
            <CModal visible={visible} onClose={() => setVisible(false)}>
                <CModalHeader>
                    <CModalTitle>Run SQL Query on {tablename}</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CFormTextarea
                        rows={6}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={`e.g. INSERT INTO ${tablename}(name) VALUES('New');\nOR UPDATE ${tablename} SET name='Updated' WHERE id=1;`}
                    />
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setVisible(false)}>
                        Cancel
                    </CButton>
                    <CButton color="primary" onClick={handleRunQuery}>
                        Run Query
                    </CButton>
                </CModalFooter>
            </CModal>
        </CContainer>
    )
}

export default TableView
