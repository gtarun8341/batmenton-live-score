import React from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logoImage from '../Logo1.png'; // Replace with the actual path to your PNG logo

function Navigation() {

  const handleLogout = () => {
    localStorage.removeItem('umpireToken');
    localStorage.removeItem('adminToken');
    // console.log('Logout successful');
    toast.success('logout successful', {
      position: 'top-right',
      autoClose: 3000, // Auto-close the notification after 3 seconds
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    window.location.href = '/'; // Redirect to home page after logout
  };

  const isUmpireLoggedIn = !!localStorage.getItem('umpireToken');
  const isAdminLoggedIn = !!localStorage.getItem('adminToken');

  return (
    <Navbar bg="light" variant="light" expand="lg">
      <Navbar.Brand href="/">
        <img
          src={logoImage}
          alt="Logo"
          width="130"
          height="30"
          className="d-inline-block align-top"
        />{' '}
      </Navbar.Brand>      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav" className="justify-content-between">
        <Nav className="mr-auto">
          <LinkContainer to="/">
            <Nav.Link>Live Scores</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/results">
            <Nav.Link>Recent Results</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/upcoming">
            <Nav.Link>Upcoming Matches</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/tournamentspage">
            <Nav.Link>Upcoming Tournament</Nav.Link>
          </LinkContainer>
        </Nav>
        <Nav>
  {isUmpireLoggedIn && (
    <LinkContainer to="/adminscore">
      <Nav.Link>AdminScore</Nav.Link>
    </LinkContainer>
  )}
  {isAdminLoggedIn && (
    <>
      <LinkContainer to="/adminpage">
        <Nav.Link>AdminPage</Nav.Link>
      </LinkContainer>
      <LinkContainer to="/admintournament">
        <Nav.Link>AdminTournament</Nav.Link>
      </LinkContainer>
    </>
  )}
</Nav>
        <Nav>
          {(isUmpireLoggedIn || isAdminLoggedIn) && (
            <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
          )}
          {!isUmpireLoggedIn && !isAdminLoggedIn && (
            <NavDropdown title="Login" id="navbarScrollingDropdown" drop='start'>
  <LinkContainer to="/umpirelogin">
    <NavDropdown.Item>Empire Login</NavDropdown.Item>
  </LinkContainer>
  <LinkContainer to="/adminlogin">
    <NavDropdown.Item>Admin Login</NavDropdown.Item>
  </LinkContainer>
</NavDropdown>

          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Navigation;
