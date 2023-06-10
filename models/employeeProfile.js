const mongoose = require('mongoose');

const employeeProfileSchema = new mongoose.Schema({
  uniqueID: {
    type: mongoose.Schema.Types.ObjectId   
  },
  Employee_ID: {
    type: String,
  },
  Full_Name: {
    type: String,
  },
  Job_Title: {
    type: String,
  },
  Department: {
    type: String,
    required: true,
  },
  Business_Unit: {
    type: String,
    required: true,
  },  
  Gender: {
    type: String,
  },
  Ethnicity: {
    type: String,
  },
  Age: {
    type:String
  },
  Hire_Date: {
    type:String
  },
  Annual_Salary: {
    type:String
  },
  Bonus: {
    type: String    
  },
  Country: {
    type: String    
  },
  City: {
    type: String    
  }
});

module.exports = Profile = mongoose.model('employeeProfileSchema', employeeProfileSchema,'employeeData');
