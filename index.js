const express = require('express');
const app = express();
const connection = require('./database/database');

const categoriesController = require('./categories/CategoriesController');
const articlesController = require('./articles/ArticlesController');

const Article = require('./articles/Article');
const Category = require('./categories/Category');

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

app.use('/', categoriesController)
app.use('/', articlesController)

app.get('/', (req, res) => {
  Article.findAll({
    order: [
      ['id', 'DESC']
    ]
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
        res.render('/');
      }
    }).catch( err => {
      res.render('/');
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

app.listen(8080, () => {
  console.log('O servidor está rodando!')
})