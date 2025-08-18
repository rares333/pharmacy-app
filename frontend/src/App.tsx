import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  AppBar,
  Toolbar,
  Button,
  Container,
  CssBaseline,
  Badge,
  Drawer,
  Slide,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar as DrawerToolbar,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import MedicationIcon   from '@mui/icons-material/Medication'
import SearchIcon       from '@mui/icons-material/Search'
import { CartProvider, useCart } from './contexts/CartContext'
import { useCard } from './contexts/CardContext'

import Home            from './pages/Home'
import Recommendations from './pages/Recommendations'
import History         from './pages/History'
import Cart            from './pages/Cart'
import AdminOrders     from './pages/AdminOrders'
import Group           from './pages/Group'
import Ticket          from './pages/Ticket'

const drawerWidth = 300

export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  )
}

function AppContent() {
  const { items }    = useCart()
  const { cardId }   = useCard()
  const { pathname } = useLocation()
  const navigate     = useNavigate()

  const isAdminRoute = pathname.startsWith('/admin')
  const showDrawer   = pathname === '/recommendations' || pathname.startsWith('/group/')
  const [categories, setCategories] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/categories`)
      .then(r => r.json())
      .then(setCategories)
      .catch(console.error)
  }, [])

  const onSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/recommendations?symptom=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Top AppBar */}
      <AppBar position="fixed" sx={{ zIndex: t => t.zIndex.drawer + 1}}>
        <Toolbar>
          {!isAdminRoute ? (
            <>
              <Button component={Link} to="/" color="inherit">Home</Button>
              {cardId && <Button component={Link} to="/history" color="inherit">History</Button>}
              <Box sx={{ flexGrow: 1, mx: 2
               }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search symptoms or products…"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onKeyDown={onSearchKey}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => {
                          if (searchTerm.trim()) 
                            navigate(`/recommendations?symptom=${encodeURIComponent(searchTerm.trim())}`)
                        }}>
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: 1,
                    width: { xs: 150, sm: 250, md: 350 }
                  }}
                />
              </Box>
              <Button component={Link} to="/cart" color="inherit">
                <Badge badgeContent={items.length} color="secondary">
                  <ShoppingCartIcon />
                </Badge>
              </Button>
            </>
          ) : (
            <Button component={Link} to="/admin/orders" color="inherit">
              Admin Dashboard
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Sliding Drawer for categories */}
      <Slide
        direction="right"
        in={showDrawer}
        mountOnEnter
        unmountOnExit
        timeout={300}
      >
        <Drawer
          variant="persistent"
          open={showDrawer}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              pt: 8,
              bgcolor: 'grey.100',
              overflowY: 'auto',
              transition: 'transform 300ms ease-in-out',
            },
          }}
        >
          <DrawerToolbar />
          <List>
            {categories.map(cat => (
              <ListItemButton
                key={cat}
                component={Link}
                to={`/group/${encodeURIComponent(cat)}`}
              >
                <ListItemIcon><MedicationIcon /></ListItemIcon>
                <ListItemText primary={cat} />
              </ListItemButton>
            ))}
          </List>
        </Drawer>
      </Slide>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          background: 'linear-gradient(90deg, #f4f6f8 0%, #ffffff 100%)',
          ...(showDrawer && { ml: `${drawerWidth}px` }),
        }}
      >
        <DrawerToolbar />
        <Container>
          <Routes>
            <Route path="/"               element={<Home />} />
            <Route path="recommendations" element={<Recommendations />} />
            <Route path="history"         element={cardId ? <History /> : <Home />} />
            <Route path="cart"            element={<Cart />} />
            <Route path="admin/orders"    element={<AdminOrders />} />
            <Route path="group/:category" element={<Group />} />
            <Route path="ticket/:orderId" element={<Ticket />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  )
}
