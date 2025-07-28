import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilDrop,
  cilPencil,
  cilSpeedometer,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const type = localStorage.getItem("type")

const dashboardNavItem = {
  component: CNavItem,
  name: 'Dashboard',
  to: type === 'Technical' ? '/technical-dashboard' : '/dashboard',
  icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  badge: {
    color: 'info',
  },
}

const _nav = [
  dashboardNavItem,
]

export default _nav
