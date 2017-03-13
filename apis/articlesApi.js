var express = require('express');
var router = express.Router();

module.exports = function(db) {
  var articlesModel = require('../models/articlesModel')(db);
  var tagsModel = require('../models/tagsModel')(db);

  router.get('/getall', function(req, res) {
    articlesModel.getAll()
      .then(data => {
        let articles = [];
        data.forEach(function (article, i) {
          // 过长的话根据换行符进行裁剪
          let content = article.content;
          if (content.length > 100) content = content.substr(0, 100) + '\n...';

          articles.push({
            id: article._id,
            title : article.title,
            content: content,
            date: article.date.toLocaleString(),
            pv: article.pv,
            tags: article.tags
          });
        }, function(err) {
          res.json(articles);
        });
      })
      .catch(err => {
        console.log(err);
      });
  });

  router.post('/add', function(req, res, next) {
    var article = req.body;
    var date = new Date();
    article.date = date;
    article.lastModifyDate = date;
    articlesModel.addArticle(article)
      .then(data => {
        tagsModel.addTags(article.tags, data.insertedIds[1]);
      })
      .then(data => {
        res.json(true);
      })
      .catch(err => {
        console.log(err);
      });
  });

  router.get('/detail/:id', function(req, res, next) {
    let id = req.params.id;
    articlesModel.getArticle(id)
      .then(data => {
        data.date = data.date.toLocaleString();
        res.json(data);
      })
      .catch(err => {
        console.log(err);
      })
  });

  router.get('/tags', function(req, res, next) {
    tagsModel.getAllTags()
      .then(data => {
        let tags = []
        data.forEach(function (tag, i) {
          tags.push({
            id: tag._id,
            name: tag.name,
            articlesId: tag.articlesId
          })
        }, function(err) {
          res.json(tags);
        });
      })
      .catch(err => {
        console.log(err);
      })
  });

  router.get('/category/:name', function(req, res, next) {
    var name = req.params.name;
    tagsModel.getTagByName(name)
      .then(articlesModel.getArticlesByTag)
      .then(data => {
        var articles = [];
        data.forEach(function (article, i) {
          // 过长的话根据换行符进行裁剪
          let content = article.content;
          if (content.length > 100) content = content.substr(0, 100) + '\n...';

          articles.push({
            id: article._id,
            title : article.title,
            content: content,
            date: article.date.toLocaleString(),
            pv: article.pv,
            tags: article.tags
          });
        }, function(err) {
          res.json(articles);
        });
      })
      .catch(err => {
        console.log(err);
      });
  });

  return router;
}