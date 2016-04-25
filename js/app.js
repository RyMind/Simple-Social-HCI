$(function() {
  Parse.$ = jQuery;
  // Initialize Parse with your Parse application javascript keys
  Parse.initialize("hg5QsPk8Lmrc3jc1wzEbCWYt2BQS0IubRi0KgnF3", "7L7PkSedRzQzAWlq5MoyoE4OeDz33K9qeDGw9fGo");

  var WAYD = Parse.Object.extend("WAYD", {
    initialize: function() {
    }
  });
  var HAYD = Parse.Object.extend("HAYD", {
    initialize: function() {
    }
  });
  var WAYDList = Parse.Collection.extend({
    model : WAYD
  });
  var wayds;
	$("#wayd" ).on( "click", ".item", function() {
		$(".wayd .item.selected").removeClass("selected");
		var user = Parse.User.current();
		var active = user.get("active");
		$(this).addClass("selected");
    if (active != null) {
    	active.fetch({
    		success : function(post) {
    			post.set("duration", Date.now()-post.get("start"));
    			post.save(null, { success : function(obj) {
	    			var obj = new WAYD();
			      obj.set("user", Parse.User.current());
			      obj.set("ACL", new Parse.ACL(Parse.User.current()));
			      obj.set("cat", $(".wayd .item.selected").text());
			      obj.set("start", Date.now());
			      obj.save(null,{ success : function(obj) { 
			      	user.set("active", obj);
			      	user.save(null,{success : function(obj) {},error : function(obj, error) {}});
						}, error : function(obj, error) {} });
    			}, error : function(obj, error) {}});
    		}
    	});
    } else {
    	var obj = new WAYD();
      obj.set("user", Parse.User.current());
      obj.set("ACL", new Parse.ACL(Parse.User.current()));
      obj.set("cat", $(".wayd .item.selected").text());
      obj.set("start", Date.now());
      obj.save(null,{ success : function(obj) { 
      	user.set("active", obj);
		  	user.save(null,{success : function(obj) {},error : function(obj, error) {}});
			}, error : function(obj, error) {} });
    }
	});
	$("#hayd").on("click", ".submit", function() {
		var user = Parse.User.current();
		var active = user.get("active");
		$(this).addClass("selected");
		if ($(".hayd .rating").val() != "" || $(".hayd .blurb").val() != "") {
	   	var obj = new HAYD();
	    obj.set("user", Parse.User.current());
	    obj.set("ACL", new Parse.ACL(Parse.User.current()));
	    obj.set("blurb", $(".hayd .blurb").val());
	    obj.set("rating", $(".hayd .rating").val());
	    obj.set("time", Date.now());
	    obj.save(null,{ success : function(obj) { 
	    	$(".hayd .rating").val("");
	    	$(".hayd .blurb").val("")
			}, error : function(obj, error) {} });
		}
  });

	var LogInView = Parse.View.extend({
    events: {
      "submit form.loginForm": "logIn",
      "submit form.signupForm": "signUp"
    },

    el: "#wayd",
    initialize: function() {
      _.bindAll(this, "logIn", "signUp");
      this.render();
    },

    logIn: function(e) {
      var self = this;
      var username = this.$("#loginUsername").val();
      var password = this.$("#loginPassword").val();
      
      Parse.User.logIn(username, password, {
        success: function(user) {
          // TODO: (1) Handle log on success
          new WAYDAppView;
          self.undelegateEvents();
          //delete self;
        },

        error: function(user, error) {
          self.$(".loginForm .error").html("Invalid username or password. Please try again.").show();
          self.$(".loginForm button").removeAttr("disabled");
        }
      });

      this.$(".loginForm button").attr("disabled", "disabled");

      return false;
    },
    signUp: function(e) {
      var self = this;
      var username = this.$("#signupUsername").val();
      var password = this.$("#signupPassword").val();
      Parse.User.signUp(username, password, { ACL: new Parse.ACL(), WAYDCats : [], active : null }, {
        success: function(user) {
          new QuizView;
          self.undelegateEvents();
          //delete self;
        },
        error: function(user, error) {
          self.$(".signupForm .error").html(_.escape(error.message)).show();
          self.$(".signupForm button").removeAttr("disabled");
        }
      });

      this.$(".signupForm button").attr("disabled", "disabled");

      return false;
    },
    render: function() {
      this.$el.html(_.template($("#loginTemplate").html()));
      this.delegateEvents();
    }
  });    

  var QuizView = Parse.View.extend({
    el: $("#wayd"),
    events: {
      "click .nextQ" : "nextQ",
      "click .response" : "selectResp"
    }, 
    initialize : function() {
      console.log("Init Quiz");
      var self = this;
      this.curQ = 0;
      this.curR = 0;
      this.choices = [];
      this.questions = [
	"Telephoning in public.", 
	"Participating in small groups.”,
	“Eating in public places.”,
	“Drinking with others in public places.”,
	“Talking to people in authority.”,
	“Acting, performing or giving a talk in front of an audience.”,
	“Going to a party.”,
	“Working while being observed.”,
	“Writing while being observed.”,
	“Calling someone you don’t know very well.”,
	“Talking with people you don’t know very well.”,
	“Meeting strangers.”,
	“Urinating in a public bathroom.”,
	“Entering a room when others are already seated.”,
	“Being the center of attention.”,
	“Speaking up at a meeting.”,
	“Taking a test.”,
	“Expressing a disagreement or disapproval to people you don’t know very well.”,
	“Looking at people you don’t know very well in the eyes.”,
	“Giving a report to a group.”,
	“Trying to pick up someone.”,
	“Returning goods to a store.”,
	“Giving a party.”,
	“Resisting a high pressure salesperson.”

      ];
      this.responseSets = [
        ["How anxious or fearful do you feel in this situation?",["None","Mild","Moderate","Severe"]], 
        ["How often do you avoid this situation?",["Never","Occasionally","Often","Usually"]]
      ];
      _.bindAll(this,'render','nextQ','selectResp');

      this.render();
    },
    nextQ : function(e) {
      if (this.curR == this.responseSets.length-1) {
        this.curQ += 1;
        this.curR = 0;
        this.render();

      } else if (this.curQ == this.questions.length-1) { 
        this.undelegateEvents();
        new WAYDAppView;

      } else {
        this.curR += 1;
        this.render();

      }
    },
    selectResp : function(e) {
      console.log(getAttribute)
    },
    render : function() {
      if (Parse.User.current()) {
        var user = Parse.User.current();
        this.$el.html(_.template($("#QUIZTemplate").html())({questions : this.questions, curQ : this.curQ, curR : this.curR, responses : this.responseSets}));
        // $("#categories").html(innards);
        this.delegateEvents();                
      } else {
        self.undelegateEvents();
        new LogInView();
      }     
    }
  });
  var WAYDAppView = Parse.View.extend({
    el: $("#wayd"),
    events: {
      "keypress #addWAYD":  "createOnEnter",
      "click .logOut": "logOut"
    },
    initialize : function() {
    	var self = this;
    	_.bindAll(this,'render','createOnEnter','logOut');
      this.input = this.$("#addWAYD");
      wayds = new WAYDList();
      this.render();
    },
    createOnEnter : function(e) {
      var self = this;
      if (e.keyCode != 13 || $("#addWAYD").val() == "") return;
      var user = Parse.User.current();
 			user.addUnique("WAYDCats",$("#addWAYD").val());
  		$("#addWAYD").val('');
  		this.render();
 			user.save(null,
        {
          success : function(obj) {
            console.log("Well... it saved...");
          },
          error : function(obj, error) {
            console.log("It actually failed D:! E: " + error.message);
          }               
        }
      );
    },
    render : function() {
      if (Parse.User.current()) {
      	var user = Parse.User.current();
	      wayds.query = new Parse.Query(WAYD);
	      wayds.query.equalTo("user", Parse.User.current());
	      wayds.fetch();	  
      	this.$el.html(_.template($("#WAYDTemplate").html()));
      	$("#hayd").html(_.template($("#HAYDTemplate").html()));
	      var cats = user.get("WAYDCats");
	      var active = user.get("active");
			  var innards = "";
	      if (active != null) {
	      	active.fetch({
	      		success : function(post) {
	      			active = post.get('cat');
	      			console.log(post.get('cat'));
			      	console.log(active);
			      	for (i in cats) {
			      		console.log(cats[i]);
			      		innards += "<div class='item"+ (cats[i] == active ? " selected" : "")+"'>"+cats[i]+"</div>";
			      	}
			      	$("#categories").html(innards);
	      		}
	      	});
	      } else {
	      	for (i in cats) {
	      		console.log(cats[i]);
	      		innards += "<div class='item'>"+cats[i]+"</div>";
	      	}
	      	$("#categories").html(innards);
	      }
	      this.delegateEvents();      	      	
      } else {
        new LogInView();
      }
    },
    logOut: function(e) {
      Parse.User.logOut();
      new LogInView();
      this.undelegateEvents();
      $("#hayd").html("");
      delete this;

    }
  }); 

var app = new WAYDAppView;
  //var app = new QuizView;
});