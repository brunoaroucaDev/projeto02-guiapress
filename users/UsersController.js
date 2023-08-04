const express = require('express');
const router = express.Router();
const User = require('./User');
const bcrypt = require('bcryptjs');

router.get('/admin/users', (req, res) => {
  User.findAll().then((users) => {
    res.render('admin/users/index', {users})
  })
});

router.get('/admin/users/create', (req, res) => {
  res.render('admin/users/create')
});

router.post('/users/create', (req, res) => {
  const { email, password } = req.body;

  User.findOne({
    where: {email: email}
  }).then( emailDB => {
    if(emailDB){
      if(!email === emailDB){
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        User.create({
          email,
          password: hash,
        }).then(()=> {
          res.redirect('/')
        }).catch(err => {
          res.redirect('/')
        })

      } else {
        res.render('admin/users/create')
      }
    }
  })

  
})

module.exports = router;