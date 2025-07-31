import React, { useEffect, useState } from 'react'
import {
    CCard,
    CCardBody,
    CCol,
    CRow,
    CAvatar,
    CContainer,
    CFormInput,
    CFormLabel,
} from '@coreui/react'
import { cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const defaultProfileImage =
    'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'

const Profile = () => {
    const [profile, setProfile] = useState({
        full_name: '',
        email: '',
        type: '',
        profile_photo: '',
    })

    useEffect(() => {
        const full_name = localStorage.getItem('full_name')
        const email = localStorage.getItem('email')
        const type = localStorage.getItem('type')

        setProfile({
            full_name,
            email,
            type,
        })
    }, [])

    return (
        <CContainer className="mt-5">
            <CRow className="justify-content-center">
                <CCol md={8} lg={6}>
                    <CCard className="text-center shadow-lg p-4 border-0" style={{ borderRadius: '1rem' }}>
                        <CCardBody>
                            <CAvatar
                                size="xxl"
                                src={profile.profile_photo || defaultProfileImage}
                                className="mb-4 border border-2 border-secondary"
                            >
                                {!profile.profile_photo && (
                                    <CIcon icon={cilUser} size="xxl" className="text-muted" />
                                )}
                            </CAvatar>
                            <CRow className='mt-2'>
                                <CCol xs={12}>
                                    <CFormLabel>User Name</CFormLabel>
                                    <CFormInput
                                        disabled
                                        value={profile.full_name}
                                    />
                                </CCol>
                            </CRow>
                            <CRow className='mt-2'>
                                <CCol xs={12}>
                                    <CFormLabel>User Email</CFormLabel>
                                    <CFormInput
                                        disabled
                                        value={profile.email}
                                    />
                                </CCol>
                            </CRow>
                            <CRow className='mt-2'>
                                <CCol xs={12}>
                                    <CFormLabel>User Type</CFormLabel>
                                    <CFormInput
                                        disabled
                                        value={profile.type}
                                    />
                                </CCol>
                            </CRow>
                            {/* <h2 className="mb-2 fw-bold">{profile.full_name || 'Full Name'}</h2>

              <div className="mb-2">
                <span className="text-secondary fs-5">📧 {profile.email || 'Email'}</span>
              </div>

              <div>
                <span className="badge bg-primary text-uppercase fs-6 px-3 py-2">
                  {profile.type || 'Type'}
                </span>
              </div> */}
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </CContainer>
    )
}

export default Profile
