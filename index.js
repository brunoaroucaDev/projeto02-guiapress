const express = require('express');
const session = require('express-session')
const app = express();
const connection = require('./database/database');

const categoriesController = require('./categories/CategoriesController');
const articlesController = require('./articles/ArticlesController');
const usersController = require('./users/UsersController');

const Article = require('./articles/Article');
const Category = require('./categories/Category');
const User = require('./users/User');

// view engine
app.set('view engine', 'ejs');

// static
app.use(express.static('public'));

// body parser
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// databse

connection
  .authenticate()
  .then(() => {
    console.log('Conexao realizada com sucesso!')
  }).catch(error => console.log(error))

app.use('/', categoriesController);
app.use('/', articlesController);
app.use('/', usersController);


app.get('/', (req, res) => {
  Article.findAll({
    order: [
      ['id', 'DESC']
    ],
    limit: 4
  })
    .then((articles) => {
        Category.findAll()
          .then(categories => {
            return res.render('index', { articles, categories });

          })
    })
});

app.get('/:slug', (req, res) => {
  const { slug } = req.params;

  if(slug){
    Article.findOne({
      where: {
        slug: slug
      }
    }).then( article => {
      if(article){
        Category.findAll()
          .then(categories => {
            return res.render('article', { article, categories });

          })
      } else {
        res.redirect('/');
      }
    }).catch( err => {
      res.redirect('/');
    })
  }
});

app.get('/category/:slug', (req, res) => {
  const { slug } = req.params;
  if (slug) {
    Category.findOne({
      where: { slug: slug},
      include: [{model: Article}]
    }).then(category => {
      if(category) {
        Category.findAll()
          .then(categories => {
            return res.render('index', { articles: category.articles, categories });

          })
      } else {
        res.redirect('/')
      }
    }).catch( err => res.redirect('/'))
  }
})

app.get('/articles/page/:num', (req, res) => {
  const page = req.params.num;
  let offset = 0;
  const limit = 4;

  if(isNaN(page) || page < 1){
    offset = 0;
  } else {
    offset = (Number(page) - 1) * limit;
  }


  Article.findAndCountAll({
    limit: limit,
    offset: offset,
    order: [
      ['id', 'DESC']
    ]
  }).then( articles => {

    let next;
    if(offset + 4 >= articles.count){
      next = false;
    } else {
      next = true;
    }

    const result = {
      next: next,
      page: Number(page),
      articles: articles.rows,
    }

    Category.findAll().then( categories => {
      res.render('admin/articles/page', {result, categories})
    })

    
  })
})

app.listen(8080, () => {
  console.log('O servidor está rodando!')
})