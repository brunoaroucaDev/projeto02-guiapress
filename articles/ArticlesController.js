const express = require('express');
const router = express.Router();
const Category = require('../categories/Category');
const Article = require('./Article');
const slugify = require('slugify');


router.get('/admin/articles', (req, res) => {
  Article.findAll({
    include: [ { model: Category } ]
  }).then((articles) => {

    res.render('admin/articles/index', {
      articles
    });
  })

});

router.get('/admin/articles/new', (req, res) => {
  Category.findAll().then( categories => {

    res.render('admin/articles/new', { categories });
  })
});

router.post('/articles/save', (req, res) => {
  const { title, category, body } = req.body;

  Article.create({
    title,
    slug: slugify(title),
    body,
    categoryId: category
  }).then(() => {
    res.redirect('/admin/articles')
  })
});

router.post('/articles/delete', (req, res) => {
  const { id } = req.body;
  if( id && id != undefined){
    if(!isNaN(id)){

      Article.destroy({
        where: {
          id: id
        }
      }).then(() => {
        res.redirect('/admin/articles')
      })

    } else {
      res.redirect('/admin/articles');
    }
  } else {
    res.redirect('/admin/articles');
  }
});

router.get('/admin/articles/edit/:id', (req, res) => {
  const {id} = req.params;
  if(isNaN(id)){
    res.redirect('/admin/articles');
  }
  Article.findByPk(id)
    .then(article => {
      if(article){
        Category.findAll().then(categories => {

          res.render('admin/articles/edit', { article, categories })
        })
      }  else {
        res.redirect('/admin/articles');
      }
    }).catch(err => res.redirect('/admin/articles'))
});

router.post('/articles/update', (req, res) => {
  const {id, title, category, body} = req.body;
  Article.update({
    title,
    slug: slugify(title),
    body,
    categoryId: category
  },{
    where: {id: id}
  }).then(() => {
 
    res.redirect('/admin/articles')
  })
})

module.exports = router;