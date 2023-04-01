import { useEffect, useState } from "react"
import NavLoginButton from "./nav-login-button"
import NavSearchIcon from "./nav-search-button"
import NavUserProfile from "./nav-user-profile"

const Profilenav = () => {
  const [currentUser, setCurrentUser] = useState(undefined)
  const [showUserProfile, setShowUserProfile] = useState(false)

  useEffect(() => {
    if (currentUser) {
      setShowUserProfile(true)
    } else {
      setShowUserProfile(false)
    }
  }, [])

  return (
    <nav className="header-nav ms-auto">
      <ul className="d-flex align-items-center">
        <NavSearchIcon />
        {showUserProfile ? (
          <NavUserProfile />
        ) : (
          <li className="nav-item pe-3">
            <NavLoginButton text="Login/ Register" />
          </li>
        )}
      </ul>
    </nav>
  )
}

export default Profilenav