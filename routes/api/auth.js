const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const loggedUser = require('../../models/loggedUser');

// @route GET api/auth
// @desc  Test route
// @access Public

router.get('/', auth, async (req, res) => {
  try {
    const user = await loggedUser.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route POST api/auth/userExist
// @desc  check if user exist for password reset
// @access Public

router.post('/userExist', [
  check('email', 'Please include a Valid email').isEmail(),
  check('secertKey', 'please include secert key').not().isEmpty()
],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let { body: { email, secertKey } } = req;


      //see if user exists
      let user = await loggedUser.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'user does not exist' }] });
      }

      if (secertKey != config.get('jwtsSecret')) {
        res.status(400).json({ errors: [{ msg: 'wrong secerty key!', wrongKey: true }] });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      //return token 
      jwt.sign(
        payload,
        config.get('jwtsSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ authtoken: token, userExist: true, userData: user });
        }
      );




    }
    catch (err) {
      console.error(err.message);
      res.status(500).json({ errors: [{ msg: 'internal server error!' }] });
    }
  });

// @route POST api/auth/updatePassword
// @desc  check if user exist for password reset
// @access Public

router.post('/updatePassword', auth, [
  check('_id', 'user id is required').not().isEmpty(),
  check('updatedPassword', 'updated Password needed').not().isEmpty()
],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }



      //Encrypt password

      let { body: { _id, updatedPassword } } = req;

      // Check for ObjectId format and post
      if (!_id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(422).json({ message: 'Invalid params' });
      }

      const salt = await bcrypt.genSalt(10);

      hashedpassword = await bcrypt.hash(updatedPassword, salt);

      let userData = await loggedUser.findByIdAndUpdate(_id, { password: hashedpassword });

      if (!userData) {
        return res
          .status(400)
          .json({ errors: [{ message: 'user does not exist' }] });
      }


      res.status(200).json({ message: "password updated" });

    }
    catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });


// @route POST api/auth
// @desc  Authenticate user & get token
// @access Public

router.post(
  '/',
  [
    check('email', 'Please include a Valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      //see if user exists
      let user = await loggedUser.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      //Return jsonwebtoken

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get('jwtsSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);


// @route POST api/auth/getUserName
// @desc  Authenticate user & get token
// @access Public

router.get(
  '/getUserName',
  auth,
 
  async (req, res) => {
    

    //destructure user id from auth middleware
    const { user : {id} } = req;

    try {
      //see if user exists
      let userDetails = await loggedUser.findById(id);

      if(!userDetails){
        res.status(500).json({ errors: [{ msg: 'user doesnt event exist' }] });
      }

      res.status(200).json(userDetails);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
