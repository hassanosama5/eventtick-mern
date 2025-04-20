<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const { protect, authorize } = require('../Middleware/authorizationMiddleware');

// Authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Test routes for different roles
router.get('/test/public', (req, res) => {
    res.json({ 
        success: true,
        message: 'Public route - accessible by anyone' 
    });
});

router.get('/test/user', 
    protect,
    (req, res) => {
        res.json({ 
            success: true,
            message: 'Protected route - accessible by any authenticated user',
            data: {
                user: {
                    id: req.user._id,
                    name: req.user.name,
                    email: req.user.email,
                    role: req.user.role
                }
            }
        });
    }
);

router.get('/test/organizer', 
    protect,
    authorize('organizer', 'admin'),
    (req, res) => {
        res.json({ 
            success: true,
            message: 'Organizer route - accessible by organizers and admins only',
            data: {
                user: {
                    id: req.user._id,
                    name: req.user.name,
                    email: req.user.email,
                    role: req.user.role
                }
            }
        });
    }
);

router.get('/test/admin', 
    protect,
    authorize('admin'),
    (req, res) => {
        res.json({ 
            success: true,
            message: 'Admin route - accessible by admins only',
            data: {
                user: {
                    id: req.user._id,
                    name: req.user.name,
                    email: req.user.email,
                    role: req.user.role
                }
            }
        });
    }
);
=======
const router = require("express").Router(); // ✅ Declare first
const { register, login } = require("../Controllers/authController"); // ✅ Import controllers

// 🔥 Define routes
router.post("/register", register);
router.post("/login", login);
>>>>>>> b4e86ace6fd102bab9f8beb83cf73d61fe875253

module.exports = router;
