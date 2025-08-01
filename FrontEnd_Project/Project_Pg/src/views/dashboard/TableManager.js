import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CFormInput,
} from '@coreui/react'
import { useLocation, useParams } from 'react-router-dom'
import axiosInstance from '../../baseURL' 

const TableRowManager = () => {
  const [rows, setRows] = useState([])
  const [columns, setColumns] = useState([])
  const [visible, setVisible] = useState(false)
  const [formData, setFormData] = useState({})
  const [editId, setEditId] = useState(null)
  const { tableName } = useParams()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const dbId = searchParams.get('dbId')
  const dbName = searchParams.get('dbName')

  useEffect(() => {
    if (!dbId || !tableName) return
    fetchTableData()
  }, [dbId, tableName])

  const fetchTableData = async () => {
    try {
      const res = await axiosInstance.get(`/databases/${dbId}/tables/${tableName}/rows`)
      const fetchedRows = res.data.rows || []
      setRows(fetchedRows)
      if (fetchedRows.length > 0) {
        const uniqueColumns = new Set()
        fetchedRows.forEach(row => {
          Object.keys(row).forEach(col => uniqueColumns.add(col))
        })
        setColumns(Array.from(uniqueColumns))
      } else {
        setColumns([])
      }
    } catch (err) {
      console.error('Failed to fetch table data:', err)
    }
  }

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/databases/${dbId}/tables/${tableName}/rows/${id}`)
      fetchTableData()
    } catch (err) {
      console.error('Error deleting row:', err)
    }
  }

  const handleEdit = (row) => {
    setEditId(row.id)
    setFormData(row)
    setVisible(true)
  }

  const handleAdd = () => {
    setEditId(null)
    setFormData({})
    setVisible(true)
  }

  const handleSubmit = async () => {
    try {
      if (editId) {
        const { database_id, ...dataWithoutDbId } = formData
        await axiosInstance.put(
          `/databases/${dbId}/tables/${tableName}/rows/${editId}`,
          dataWithoutDbId
        )
      } else {
        await axiosInstance.post(
          `/databases/${dbId}/tables/${tableName}/rows`,
          formData
        )
      }
      setVisible(false)
      fetchTableData()
    } catch (err) {
      console.error('Error saving row:', err)
    }
  }

  const editableColumns = columns.filter(col => col !== 'id' && col !== 'database_id')

  return (
    <>
      <CCard className="mt-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>{tableName} - Table Rows</strong>
          <CButton onClick={handleAdd}>+ Add Row</CButton>
        </CCardHeader>
        <CCardBody>
          {rows.length > 0 ? (
            <CTable bordered hover responsive>
              <CTableHead>
                <CTableRow>
                  {columns.map(col => (
                    <CTableHeaderCell key={col}>{col}</CTableHeaderCell>
                  ))}
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {rows.map(row => (
                  <CTableRow key={row.id}>
                    {columns.map(col => (
                      <CTableDataCell key={col}>{row[col]}</CTableDataCell>
                    ))}
                    <CTableDataCell>
                      <CButton
                        color="warning"
                        size="sm"
                        onClick={() => handleEdit(row)}
                      >
                        Edit
                      </CButton>{' '}
                      <CButton
                        color="danger"
                        size="sm"
                        onClick={() => handleDelete(row.id)}
                      >
                        Delete
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          ) : (
            <p>No data found. Use "+ Add Row" to insert a new entry.</p>
          )}
        </CCardBody>
      </CCard>
      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>{editId ? 'Edit Row' : 'Add Row'}</CModalHeader>
        <CModalBody>
          {editableColumns.map(col => (
            <div key={col} className="mb-3">
              <label className="form-label">{col}</label>
              <CFormInput
                value={formData[col] || ''}
                onChange={(e) =>
                  setFormData({ ...formData, [col]: e.target.value })
                }
              />
            </div>
          ))}
        </CModalBody>
        <CModalFooter>
          <CButton onClick={handleSubmit}>Save</CButton>
          <CButton color="secondary" onClick={() => setVisible(false)}>Cancel</CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default TableRowManager
