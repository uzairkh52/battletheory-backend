const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  authUser, 
  getUsers, 
  updateUserRole 
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);

// Admin User Management Routes (Mounted under /api/auth/users)
router.get('/users', protect, admin, getUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);

module.exports = router;