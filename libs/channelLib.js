
const loggedUser = require('../models/loggedUser');

let messageFormat = (username, text , type) => {
    return {
        userid :username,
        message:text,
        messageType:type
    };
};

let getUserdetails = async (id) =>{
    //destructure user id from auth middleware
   

    try {
      //see if user exists
      let userDetails = await loggedUser.findById(id);

      if(!userDetails){
        return null;
      }

      let document =userDetails.toJSON();

      return document;

      
    } catch (err) {
        return null;
    }
}

module.exports = { 
formatMessage : messageFormat,
loggerUserdetails : getUserdetails
};