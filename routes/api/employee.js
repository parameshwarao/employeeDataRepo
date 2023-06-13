const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const paramChecker = require('../../libs/checkLib');


const employeeDataModel = require('../../models/employeeProfile');


// @route    POST api/CreateEmployee
// @desc     Create a employee Records
// @access   Private
router.post(
  '/CreateEmployee',
  [auth, [
    check('Employee_ID', 'Employee ID is required').not().isEmpty(),
    check('Full_Name', 'Full Name is required').not().isEmpty(),
    check('Job_Title', 'Job Title is required').not().isEmpty(),
    check('Department', 'Job Title is required').not().isEmpty(),
    check('Business_Unit', 'Business_Unit is required').not().isEmpty(),
    check('Gender', 'Gender is required').not().isEmpty(),
    check('Ethnicity', 'Ethnicity is required').not().isEmpty(),
    check('Age', 'Ethnicity is required').not().isEmpty(),
    check('Hire_Date', 'Hire_Date is required').not().isEmpty(),
    check('Annual_Salary', 'Annual_Salary is required').not().isEmpty(),
    check('Bonus', 'Bonus is required').not().isEmpty(),
    check('Country', 'Country is required').not().isEmpty(),
    check('City', 'City is required').not().isEmpty()
  ]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      

      let existingUserEmpID = await employeeDataModel.find({"Employee_ID":req.body.Employee_ID});

      if(existingUserEmpID.length > 0 ){
        return res.status(422).json({ message : 'employee already exists'});
      }
        let { body :{ 
          Employee_ID , 
          Full_Name ,
          Job_Title,
          Department,
          Business_Unit,
          Gender,
          Ethnicity,
          Age,
          Hire_Date,
          Annual_Salary,
          Bonus,
          Country,
          City}
        } = req;
  
        const newEmployee = new employeeDataModel({
          Employee_ID :Employee_ID, 
          Full_Name :  Full_Name,
          Job_Title : Job_Title,
          Department : Department,
          Business_Unit : Business_Unit,
          Gender : Gender,
          Ethnicity : Ethnicity,
          Age : Age,
          Hire_Date : Hire_Date,
          Annual_Salary : Annual_Salary,
          Bonus : Bonus,
          Country : Country,
          City : City
        });
  
        let savedEmployeeDetails = await newEmployee.save();
  
        res.json(savedEmployeeDetails);

      

      

      
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

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




// @route    GET api/employeeDetail/:id
// @desc     Get employeeDetail by ID
// @access   Private
router.get('/employeeDetail/:id', auth, async (req, res) => {
  try {
    const employeeDetail = await employeeDataModel.findById(req.params.id);

    // Check for ObjectId format and post
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/) || !employeeDetail) {
      return res.status(204).json({ message: 'employee details not found!' });
    }

    res.status(200).json(employeeDetail);
  } catch (err) {
    console.error(err.message);

    res.status(500).send('Server Error');
  }
});



// @route    DELETE api/RemoveEmployee/:id
// @desc     Remove a employee
// @access   Private
router.delete('/RemoveEmployee/:id', auth, async (req, res) => {
  try {
    let employeeData = await employeeDataModel.findByIdAndDelete(req.params.id);

    // Check for ObjectId format and post
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/) || !employeeData) {
      return res.status(204).json({ message: 'Employee not found' });
    }    

    res.status(200).json({ message: 'Employee Data Removed!' });
  } catch (err) {
    console.error(err.message);

    res.status(500).send('Server Error');
  }
});

// @route    PUT api/updateEmployee/:id
// @desc     update employee details 
// @access   Private
router.put('/updateEmployee', auth, async (req, res) => {

  
  try {

   

    let { body :{
      _id, 
      Employee_ID , 
      Full_Name ,
      Job_Title,
      Department,
      Business_Unit,
      Gender,
      Ethnicity,
      Age,
      Hire_Date,
      Annual_Salary,
      Bonus,
      Country,
      City}
    } = req;

      // Check for ObjectId format and post
   if (!_id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(422).json({ message: 'Invalid params' });
  } 

    let udpateEmployeeObject = {
      Employee_ID :  Employee_ID, 
      Full_Name :  paramChecker.nullValueHandler(Full_Name) ,
      Job_Title :  paramChecker.nullValueHandler(Job_Title),
      Department :  paramChecker.nullValueHandler(Department),
      Business_Unit :  paramChecker.nullValueHandler(Business_Unit),
      Gender :  paramChecker.nullValueHandler(Gender),
      Ethnicity :  paramChecker.nullValueHandler(Ethnicity),
      Age :  paramChecker.nullValueHandler(Age),
      Hire_Date :  paramChecker.nullValueHandler(Hire_Date),
      Annual_Salary :  paramChecker.nullValueHandler(Annual_Salary),
      Bonus :  paramChecker.nullValueHandler(Bonus),
      Country :  paramChecker.nullValueHandler(Country),
      City :  paramChecker.nullValueHandler(City)
    };
    let employeeData = await employeeDataModel.findByIdAndUpdate(_id,udpateEmployeeObject);
    
    if(!employeeData){
      res.status(204).json({message:"Employee does not exist!"});
    }   

    res.status(200).json(employeeData);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
