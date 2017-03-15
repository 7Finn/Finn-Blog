
module.exports = function(db) {
	var articles = db.collection('articles');
  var ObjectID = require('mongodb').ObjectID;

	return {
    addArticle: function(article) {
			return articles.insert(article);
    },
    getAll: function() {
			return new Promise(function(resolve, reject) {
				resolve(articles.find().sort({date:-1}));
			});
    },
		getArticlesFrom: function(start, num) {
			return new Promise(function(resolve, reject) {
				resolve(articles.find().sort({date:-1}).skip(parseInt(start)).limit(num));
			});
		},
    getArticle: function(id) {
			let p1 = articles.updateOne({_id:ObjectID(id)}, {$inc:{pv:1}}); //自增长一点访问
			let p2 = articles.findOne({_id:ObjectID(id)});
			return Promise.all([p1, p2]);
    },
		getArticlesByTag: function(tag) {
			return articles.find({tags: tag.name}).sort({date:-1});
		},
    deleteArticle: function(id) {
      return articles.remove({_id:ObjectID(id)});
    },
    updateArticle: function(id, data) {
      return articles.updateOne({_id:ObjectID(id)}, {$set:{title:data.title, text:data.text}});
    }
  }
};
