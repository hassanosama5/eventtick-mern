const express = require("express");


const userController = require("../Controllers/userController");

// * login
router.post("/login",userController.login );
// * register
router.post("/register",userController.register);

const router = require('express').Router();
const { register, login } = require('../Controllers/authController');

module.exports = router; // ! Don't forget to export the router