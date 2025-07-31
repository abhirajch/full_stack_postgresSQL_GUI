import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilUser,
  cilList, 
} from '@coreui/icons'
import { CNavItem } from '@coreui/react'

const type = localStorage.getItem("type")

const dashboardNavItem = {
  component: CNavItem,
  name: 'Dashboard',
  to: type === 'Technical' ? '/technical-dashboard' : '/dashboard',
  icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
}

const profileNavItem = {
  component: CNavItem,
  name: 'Profile',
  to: '/profile',
  icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
}


const _nav = [
  dashboardNavItem,
  profileNavItem,
]

export default _nav
