const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const paramChecker = require('../../libs/checkLib');


const employeeDataModel = require('../../models/employeeProfile');


// @route    POST api/posts
// @desc     Create a post
// @access   Private
/*router.post(
  '/',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();

      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);
*/
// @route    GET api/employee
// @desc     Get all employee data
// @access   Private
router.post('/List', auth, async (req, res) => {

  let pagination=0;
  let skipped=0;
  let pageSize = 15;

  try {

    if(!paramChecker.isEmpty(req.body.pageIndex)){    
    pagination = (req.body.pageIndex && req.body.pageIndex >0) ? req.body.pageIndex : 0 ;    
    skipped = pageSize*pagination;
  }

  let query ={};

if(!paramChecker.isEmpty(req.body.Employee_ID)) {
    query.Employee_ID  = new RegExp(req.body.Employee_ID, "i");
}
if(!paramChecker.isEmpty(req.body.Full_Name)) {
    query.Full_Name  = new RegExp(req.body.Full_Name, "i");
}
if(!paramChecker.isEmpty(req.body.Job_Title)) {
    query.Job_Title  = new RegExp(req.body.Job_Title, "i");
}

if(!paramChecker.isEmpty(req.body.Department)) {
  query.Department  = new RegExp(req.body.Department, "i");
}

if(!paramChecker.isEmpty(req.body.Business_Unit)) {
  query.Business_Unit  = new RegExp(req.body.Business_Unit, "i");
}

if(!paramChecker.isEmpty(req.body.Gender)) {
  query.Gender  = new RegExp(req.body.Gender, "i");
}

if(!paramChecker.isEmpty(req.body.Ethnicity)) {
  query.Ethnicity  = new RegExp(req.body.Ethnicity, "i");
}

if(!paramChecker.isEmpty(req.body.Country)) {
  query.Country  = new RegExp(req.body.Country, "i");
}

if(!paramChecker.isEmpty(req.body.City)) {
  query.City  = new RegExp(req.body.City, "i");
}



    /*let employeeData = await employeeDataModel
    .find()
    .skip(skipped)
    .limit(pageSize);
    */
    
    let employeeDatas = await employeeDataModel.aggregate([
      {
        "$facet":{
          "empdata":[
            { "$match": query},
            { "$skip": skipped },
            { "$limit": pageSize }
          ],
          "totalCount":[
            { "$match": query},
            {"$group":{
              "_id": null,
              "count": { "$sum": 1 }
            }}
          ]
        }
      }
    ]);
    
    
    res.json(employeeDatas[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route    GET api/employee/DepartmentOptions
// @desc     Get all employee data unique department options
// @access   Private
router.get('/DepartmentOptions', auth, async (req, res) => {
  
  try {
    const uniqueOption = await employeeDataModel.distinct('Department');
      
    
    res.json(uniqueOption);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/employee/BussinessUnitOptions
// @desc     Get all employee data unique bussiness unit options
// @access   Private
router.get('/BussinessUnitOptions', auth, async (req, res) => {
  try {
    const uniqueOption = await employeeDataModel.distinct('Business_Unit').sort();
      
    
    res.json(uniqueOption);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/employee/CountryOptions
// @desc     Get all employee data unique country options
// @access   Private
router.get('/CountryOptions', auth, async (req, res) => {
  try {
    const uniqueOption = await employeeDataModel.distinct('Country').sort();
      
    
    res.json(uniqueOption);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route    GET api/employee/CountryOptions
// @desc     Get all employee data unique country options
// @access   Private
router.get('/CityOptions', auth, async (req, res) => {
  try {
    const uniqueOption = await employeeDataModel.distinct('City').sort();
      
    
    res.json(uniqueOption);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/employee/genderOption
// @desc     Get all employee data unique gender options
// @access   Private
router.get('/GenderOptions', auth, async (req, res) => {
  try {
    const uniqueOption = await employeeDataModel.distinct('Gender').sort();
      
    
    res.json(uniqueOption);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/EthnicityOptions', auth, async (req, res) => {
  try {
    const uniqueOption = await employeeDataModel.distinct('Ethnicity').sort();
      
    
    res.json(uniqueOption);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});




// @route    GET api/posts/:id
// @desc     Get post by ID
// @access   Private
/*router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check for ObjectId format and post
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/) || !post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);

    res.status(500).send('Server Error');
  }
});

// @route    DELETE api/posts/:id
// @desc     Delete a post
// @access   Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check for ObjectId format and post
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/) || !post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await post.remove();

    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);

    res.status(500).send('Server Error');
  }
});

// @route    PUT api/posts/like/:id
// @desc     Like a post
// @access   Private
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked
    if (post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Post already liked' });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    return res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/posts/unlike/:id
// @desc     Unlike a post
// @access   Private
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked
    if (!post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Post has not yet been liked' });
    }

    // remove the like
    post.likes = post.likes.filter(
      ({ user }) => user.toString() !== req.user.id
    );

    await post.save();

    return res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/posts/comment/:id
// @desc     Comment on a post
// @access   Private
router.post(
  '/comment/:id',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    DELETE api/posts/comment/:id/:comment_id
// @desc     Delete comment
// @access   Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Pull out comment
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );
    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist' });
    }
    // Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    post.comments = post.comments.filter(
      ({ id }) => id !== req.params.comment_id
    );

    await post.save();

    return res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

*/
module.exports = router;
