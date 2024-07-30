var express = require('express');
const {mongoose} = require('mongoose');
const {dbUrl} = require('../api/config/dbConfig');
const {userModel} = require ('../schema/userSchema');
const {hashPassword, hashCompare, createToken, decodeToken, validate, roleAdmin} = require('../api/config/auth')

var router = express.Router();

mongoose.connect(dbUrl,{ useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Failed to connect to MongoDB', err));





router.get('/allusers', validate, roleAdmin, async(req, res)=>{
  try {
    let users = await userModel.find({}, {password:0});
    res.send({statusCode:200, users, message:"DATA Fetch Successfull"})
  } catch (error) {
    console.log(error);
    res.send({statusCode:500, message:"Internal server Error"})
  }
})




router.get('/userprofile',validate, async (req, res) => {

  try {
    const { email, firstname, lastname, role, imageUrl} = req.body;

    console.log(email, firstname, lastname, role, imageUrl);

    let user = await userModel.findOne({ email }, { password: 0 });

    if (!user) 
    {
    return res.send({statusCode:400, message:"user not Found"})
  } else {

  res.send({statusCode:200, message:"Profile fetched Successfully", user: { email, firstName, lastName, role, imageUrl: user.imageUrl }})
  }

  } catch (error) {

    res.send({statusCode:500, message:"Internal server Error"})
    
  }
})



router.post('/signup', async(req, res)=>{
  try {
    let user = await userModel.findOne({email:req.body.email})
    if(!user){
      let hashedPassword = await hashPassword(req.body.password)
      let data = {
          firstname : req.body.firstname,
          lastname : req.body.lastname,
          email : req.body.email,
          password : hashedPassword, 
      } 
      await userModel.create(data)

      res.send({statusCode:200, message:"User Signup Successful"})

    }else
      res.send({statusCode:400, message:"User already exists"})

  } catch (error) {
    console.log(error);
    res.send({statusCode:500, message:"Internal server Error"})
  }
})


router.post('/login', async(req, res)=>{
  try {

    let user = await userModel.findOne({email:req.body.email})

    if (user) {
      if(await hashCompare(req.body.password, user.password))
      {
        let token = await createToken(user)
        if (user.role === 'admin') {
          res.send({
            statusCode: 200,
            message: "Admin Login Successful",
            role: 'admin',
            token,
            firstname: user.firstname 
          });
        } else if (user.role === 'user') {
          res.send({
            statusCode: 200,
            message: "User Login Successful",
            role: 'user',
            token,
            firstname: user.firstname 
          });

        } else {
          res.send({statusCode:400, message:"Invalid Role"})
        }
      }
      else
        res.send({statusCode:400, message:"Invalid Crediantials"})
    }
    else 
      res.send({statusCode:400, message:"User doesnot exists"})
  } catch (error) {
    console.log(error);
    res.send({statusCode:500, message:"Internal server Error"})
  }
})


router.delete('/delete-user/:id', async (req, res) => {
  try {
    const deletedUser = await userModel.findOneAndDelete({_id: req.params.id});

    if (!deletedUser) {
      return res
        .status(404)
        .send({ statusCode: 404, message: "User not found" });
    }

    res.send({
      statusCode: 200,
      user: deletedUser,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.send({ statusCode: 500, message: "Internal server error" });
  }
});


router.put('/updateuser/:email', async (req, res) => {
  try {

    const updatedUser = await userModel.findOneAndUpdate(
      { email: req.params.email },
      req.body,
      { new: true } 
    );

    console.log(updatedUser);
    
    if (!updatedUser) {
      res.send({ statusCode: 404, message: "User not found" });
    }

    res.send({
      statusCode: 200,
      user: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.send({ statusCode: 500, message: "Internal server error" });
  }
});


router.post('/adduser', async (req, res) => {
  try {
    const { firstName, lastName, role, email, password } = req.body;
    const existingUser = await userModel.findOne({ email: email });
    if (existingUser) {
      return res.status(400).send({ statusCode: 400, message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10); 
    const newUser = new userModel({
      firstname,
      lastname,
      role,
      email,
      password: hashedPassword,
    });
    const savedUser = await newUser.save();

    res.send({
      statusCode: 200,
      user: savedUser,
      message: 'User added successfully',
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ statusCode: 500, message: 'Internal server error' });
  }
});


router.put('/update-role/:id', async (req, res) => {
  const { id } = req.params;
  const { newRole } = req.body;

  try {
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ statusCode: 404, message: 'User not found' });
    }

    user.role = newRole;
    await user.save();
    res.send({statusCode:200, message: 'User role updated successfully', user})

  } catch (error) {
    console.error(error);
    res.status(500).json({ statusCode: 500, message: 'Internal server error' });
  }
});






module.exports = router;