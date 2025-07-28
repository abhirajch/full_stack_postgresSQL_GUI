import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormSelect,
  CCard,
  CCardBody,
  CCardTitle,
} from '@coreui/react'
import axiosInstance from '../../baseURL'

const columnTypes = ['VARCHAR(255)', 'INTEGER', 'TEXT', 'BOOLEAN']

const DatabaseTable = () => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { db } = state || {}
  const [visible, setVisible] = useState(false)
  const [columns, setColumns] = useState([])
  const [rows, setRows] = useState([{}])
  const [tableName, setTableName] = useState('')
  const [existingTables, setExistingTables] = useState([])

  useEffect(() => {
    if (!db?.id) return
    const fetchTables = async () => {
      try {
        const res = await axiosInstance.get(`/databases/${db.id}/related-tables`)
        setExistingTables(res.data.tables)
      } catch (err) {
        console.error('Error fetching tables:', err)
        alert('Failed to fetch tables')
      }
    }
    fetchTables()
  }, [db])
  const handleAddColumn = () => {
    setColumns([...columns, { name: '', type: '' }])
  }
  const handleAddRow = () => {
    setRows([...rows, {}])
  }
  const handleColumnChange = (index, key, value) => {
    const updated = [...columns]
    updated[index][key] = value
    setColumns(updated)
  }
  const handleRowChange = (rowIndex, colName, value) => {
    const updated = [...rows]
    updated[rowIndex][colName] = value
    setRows(updated)
  }
  const handleSubmit = async () => {
    if (!tableName || columns.length === 0 || rows.length === 0) {
      alert('Please provide table name, at least one column and one row.')
      return
    }
    try {
      const res = await axiosInstance.post(`/databases/${db.id}/tables`, {
        tableName,
        columns,
        data: rows,
      })
      alert('Table created successfully')
      setVisible(false)
      setColumns([])
      setRows([{}])
      setTableName('')
      setExistingTables([...existingTables, tableName])
    } catch (err) {
      console.error('Error creating table:', err)
      alert(err.response?.data?.error || 'Failed to create table')
    }
  }
  const handleTableClick = (table) => {
    navigate(`/table/${table}?dbId=${db.id}&dbName=${db.db_name}`)
  }
  return (
    <div className="p-4">
      <h3>Database: {db?.db_name}</h3>
      {existingTables.length === 0 ? (
        <CButton color="success" onClick={() => setVisible(true)}>+ Add Table</CButton>
      ) : (
        <div className="mb-3">
          <CButton color="success" onClick={() => setVisible(true)}>+ Add Table</CButton>
          <h5>Tables in this Database:</h5>
          {existingTables.map((table, index) => (
            <CCard
              key={index}
              className="mb-2"
              onClick={() => handleTableClick(table)}
              style={{ cursor: 'pointer' }}
            >
              <CCardBody>
                <CCardTitle>🧾{table}</CCardTitle>
              </CCardBody>
            </CCard>
          ))}
        </div>
      )}
      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>Add New Table</CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              label="Table Name"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="mb-3"
            />
            <h5>Columns</h5>
            {columns.map((col, index) => (
              <div key={index} className="d-flex mb-2 gap-2">
                <CFormInput
                  placeholder="Column Name"
                  value={col.name}
                  onChange={(e) => handleColumnChange(index, 'name', e.target.value)}
                />
                <CFormSelect
                  value={col.type}
                  onChange={(e) => handleColumnChange(index, 'type', e.target.value)}
                >
                  <option>Select Type</option>
                  {columnTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </CFormSelect>
              </div>
            ))}
            <CButton color="secondary" onClick={handleAddColumn} className="mb-3">+ Add Column</CButton>
            <h5>Initial Data</h5>
            {rows.map((row, rowIndex) => (
              <div key={rowIndex} className="mb-2">
                {columns.map((col) => (
                  <CFormInput
                    key={col.name}
                    placeholder={col.name}
                    className="mb-1"
                    value={row[col.name] || ''}
                    onChange={(e) => handleRowChange(rowIndex, col.name, e.target.value)}
                  />
                ))}
              </div>
            ))}
            <CButton color="secondary" onClick={handleAddRow}>+ Add Row</CButton>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleSubmit}>Create Table</CButton>
          <CButton color="danger" onClick={() => setVisible(false)}>Cancel</CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default DatabaseTable
