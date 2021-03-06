<template>
  <div id="editor">
    <input v-model="title" class="title" placeholder="标题"/>
    <input v-model="tags" class="tags" placeholder="标签，用;分隔" v-if="!articleId"/>
    <div class="mark-area">
      <textarea class="marked-mk" :value="input" @input="update" ></textarea>
      <div class="marked-html" v-html="compiledMarkdown" ></div>
    </div>
    <slot name="btn"></slot>
    <button type="button" name="button" class="post" @click='updateArticle' v-if="articleId">更新博客</button>
    <button type="button" name="button" class="post" @click='submitArticle' v-else>发表博客</button>
  </div>
</template>

<script>
import marked from 'marked'
import _ from 'lodash';

marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false,
    highlight: function(code) {
        return hljs.highlightAuto(code).value;
    }
});


export default {
  props: ['articleId'],
  data: function() {
    return {
      input: '# hello',
      title: '',
      tags: '',
    }
  },
  beforeCreate: function() {
    if (!this.$store.state.isManager) this.$router.replace('/404');
  },
  mounted: function() {
    if (this.articleId) {
      this.$http.get("/api/article/detail?id=" + this.articleId)
        .then(res => {
          if (!res.body.err) {
            this.input = res.body.data.content;
            this.title = res.body.data.title;
          }
        })
    }
  },
  computed: {
    compiledMarkdown: function () {
      return marked(this.input, { sanitize: true })
    }
  },
  methods: {
    update: _.debounce(function (e) {
      this.input = e.target.value;
    }, 300),
    submitArticle: function() {
      let date = new Date();
      let article = {
        title: this.title,
        tags: this.tags.split(";"),
        content: this.input,
        pv: 0,
      }
      this.$http.post('/api/article/add', article)
        .then(res => { // success
          if (!res.body.err) {
            console.log("发表成功");
            this.$router.push('/manager');
          } else {
            console.log("发表时出现了点问题");
          }
        }, res => { //fail
          console.log("发表失败");
        })
    },
    updateArticle: function() {
      let article = {
        title: this.title,
        content: this.input,
      }
      this.$http.post('/api/article/update?id='+this.articleId, article)
        .then(res => { // success
          if (!res.body.err) {
            console.log("更新成功");
            this.$router.push('/manager');
          } else {
            console.log("更新时出现了点问题");
          }
        }, res => { //fail
          console.log("更新失败");
        })
    }
  }
}
</script>

<style lang="css">
html, body, #editor {
  margin: 0;
  height: 100%;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

#editor .marked-mk {
  left: 0;
  border: none;
  border-right: 1px solid #ccc;
  resize: none;
  outline: none;
  background-color: #f6f6f6;
  font-size: 14px;
  font-family: 'Monaco', courier, monospace;
  padding: 20px;
  position: absolute;
  display: inline-block;
  width: 50%;
  height: 100%;
  vertical-align: top;
  box-sizing: border-box;
  overflow: auto;
}

#editor .marked-html {
  right: 0;
  position: absolute;
  display: inline-block;
  width: 50%;
  height: 100%;
  vertical-align: top;
  box-sizing: border-box;
  padding: 0 20px;
  overflow: auto;
}

#editor .title {
  width: 100%;
  height: 46px;
  padding: 10px 16px;
  font-size: 18px;
  line-height: 1.33;
  border-radius: 2px;
  background-color: #fff;
  border: 1px solid #ccc;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
  color: #555;
  box-sizing:border-box;
  transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
}

#editor .title:focus {
  border-color: #66afe9;
  outline: none;
  box-shadow: 0 0 2px 1px #78aeda, inset 0 0 2px #78aeda;
}

#editor .tags {
  margin-top: 20px;
  width: 100%;
  cursor: text;
  height: 33px;
  padding: 5px 5px 5px 5px;
  font-size: 14px;
  vertical-align: middle;
  line-height: 1.5;
  border-radius: 2px;
  background-color: #fff;
  border: 1px solid #ccc;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
  color: #555;
  box-sizing:border-box;
  outline: none;
}

#editor .tags:focus {

}

#editor .mark-area {
  position: relative;
  border-radius: 2px;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
  background-color: #fff;
  border: 1px solid #ccc;
  margin-top: 20px;
  width: 100%;
  padding: 0;
  min-height: 400px;
  height: 70%;
}

#editor .post {
  background-color: #009a61;
  border: 1px solid #008151;
  color: #fff;
  font-size: 15px;
  height: 30px;
  float: right;
  margin-top: 20px;
}

#editor .post:active {
  background-color: #006741;
  border: 1px solid #00432a;
}



</style>
