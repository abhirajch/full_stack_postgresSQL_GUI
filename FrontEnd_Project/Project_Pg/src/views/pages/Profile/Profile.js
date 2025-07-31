import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCol,
  CRow,
  CAvatar,
} from '@coreui/react'
import { cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const defaultProfileImage = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y' // or use your own default

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
    <CRow className="justify-content-center mt-4">
      <CCol md={6}>
        <CCard className="text-center shadow-sm">
          <CCardBody>
            <CAvatar
              size="xxl"
              src={profile.profile_photo || defaultProfileImage}
              className="mb-3 border border-secondary"
            >
              {!profile.profile_photo && (
                <CIcon icon={cilUser} size="xxl" className="text-muted" />
              )}
            </CAvatar>
            <h4>{profile.full_name || 'Full Name'}</h4>
            <p className="text-medium-emphasis mb-1">{profile.email || 'Email'}</p>
            <p className="text-uppercase fw-semibold">{profile.type || 'Type'}</p>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Profile
