Large.Views.NewStory = Backbone.View.extend({
  template: JST['stories/new_story'],
  header: JST['stories/_new_story_header'],
  insertToolbar: JST['stories/_insert_toolbar'],

  events: {
    "click #header-image": "addImage",
    "click #submit-confirm": "submitForm",
    "click #confirm": "autoSave",
    "keyup #body": "handleKeyup",
    "keydown #body": "handleBodyKeydown",
    "keydown #title": "handleTitleKeydown",
    "keydown #subtitle": "handleSubtitleKeydown",
    "keyup #title": "handlePlaceholders",
    "keyup #subtitle": "handlePlaceholders",
    "click .insert-pic": "insertPic",
    "click .insert-line": "insertLine",
    "click .editable": "showToolbar",
    "click .new-insert": "showHiddenButtons",
    "click .closer": "reseedToolbars"
  },

  initialize: function (options) {
    this.collection = options.collection;
    this.publications = options.publications;
    this.ttags = options.ttags;

    this.listenTo(this.ttags, 'sync', this.render);
    this.listenTo(this.publications, 'sync', this.render);
  },

  render: function () {
    $('.navbar-nav').find('.new-story-header').remove();
    $('.navbar-header').find('.about-link').remove();
    $('.navbar-nav').find('.user-edit-toggle').remove();

    var headerContent = this.header({
      story: this.model,
      publications: this.publications
    });
    if ($('.new-story-header').length < 1 && this.publications.length) {
      $('.navbar-header').after(headerContent);
    }
    this.$el.html(this.template({ story: this.model, publications: this.publications }));

    var editor = new MediumEditor('.editable', {
      placeholder: "",
      buttons: ['bold', 'italic', 'justifyCenter', 'justifyLeft', 'quote', 'anchor']
    });
    $('#title p').before(this.insertToolbar({ type: "title" }));
    $('#subtitle p').before(this.insertToolbar({ type: "subtitle" }));
    $('#body p').before(this.insertToolbar({ type: "" }));
    this.$('#tags-select').selectivity({
      inputType: 'Email'
    });
    $('p').tooltip({
      placement: 'top',
      trigger: 'manual'
    });
    $('#header-imager').tooltip({
      placement: 'top',
      trigger: 'hover'
    });
    $('.selectivity-multiple-input-container').css('background', 'transparent');
    $('.navbar-nav').find('.user-edit-toggle').remove();

    $('#title').focus();
    this.showToolbar();
    return this;
  },

  handleTitleKeydown: function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      var $subtitle = $('#subtitle');
      if ($subtitle) {
        $subtitle.focus();
      } else {
        $('#body').focus();
      }
      this.showToolbar(event);
    }
  },

  handleSubtitleKeydown: function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      $('#body').get(0).focus();
      this.showToolbar(event);
    } else if (event.keyCode === 8) {

    }
  },

  handleKeyup: function (event) {
    event.preventDefault();
    var tb = this.insertToolbar({ type: "" });
    var $target = $(event.target);

    if (event.keyCode === 13) {
      $target.children().each( function () {
        if ($(this).is('p') && !$(this).prev().is('.insert-toolbar')) {
          $(this).before(tb);
        }
      });
      this.showToolbar(event);
    }

    if ($('p').text().length < 3) {
      $('p').tooltip('show');
      setTimeout(function () {
        $('p').tooltip('destroy');
      }, 2500);
    }
  },

  handleBodyKeydown: function (event) {

  },

  handlePlaceholders: function(event) {
    var $el = $(event.target);
    var $titleEl = $el.find('.title');
    var $subtitleEl = $el.find('.subtitle');

    if ($titleEl) {
      if ($titleEl.text() !== "") {
        $titleEl.removeClass('show-placeholder');
      } else {
        $titleEl.addClass('show-placeholder');
      }
    }

    if ($subtitleEl) {
      if ($subtitleEl.text() !== "") {
        $subtitleEl.removeClass('show-placeholder');
      } else {
        $subtitleEl.addClass('show-placeholder');
      }
    }
  },

  addImage: function () {
    filepicker.setKey("AFA8IlPkxSNC1BPrgoHtsz");

    filepicker.pick(
      {
        mimetypes:'image/*',
        services:'COMPUTER'
      },
      function (Blob) {
        var image = Blob.url;
        this.model.set("header_image", image);
        this.$('.image').html("<img src='" + image + "'>");
      }.bind(this)
    )
  },

  showToolbar: function (event) {
    p = window.getSelection().focusNode;
    $('p').each( function () {
      if ((this !== p) && $(this).prev().is('.insert-toolbar')) {
        $(this).prev().removeClass('visible');
        $(this).prev().removeClass('open');
        $(this).css('opacity', 1);
      } else {
        $(this).prev().first().addClass('visible');
      }
    })
  },

  showHiddenButtons: function (event) {
    var $toolbar = $(event.currentTarget).parent();

    if ($toolbar.hasClass('open')) {
      $toolbar.removeClass('open');
    } else {
      $toolbar.addClass('open');
    }
  },

  insertPic: function (event) {
    var $para = $(event.currentTarget).parent().parent().next();

    filepicker.setKey("AFA8IlPkxSNC1BPrgoHtsz");
    filepicker.pick(
      {
        mimetypes:'image/*',
        services:'COMPUTER'
      },
      function (Blob) {
        var image = Blob.url;
        $para.html("<img style='max-width:400px' src='" + image + "'>");
      }.bind(this)
    )
  },

  insertLine: function (event) {
    var $para = $(event.currentTarget).parent().parent().next();
    $para.html("<div style='width:100%'><hr noshade size=1 width='33%'><br></div>");
  },

  autoSave: function (event) {
    if ($('p').text() === "") {
      $('#blankStoryError').modal('show');
      setTimeout( function () {
        $('#blankStoryError').modal('hide');
      }, 2500)
    } else {
      $('#confirmPublish').modal('show');
      $('.insert-toolbar').remove();
      var title = $($('.title')[0]).text();
      var subtitle = $($('.subtitle')[0]).text();
      var titleHTML = this.$('#title').html() || "";
      var subtitleHTML = this.$('#subtitle').html() || "";
      this.model.set("body", titleHTML + subtitleHTML + this.$('#body').html());
      this.model.set("title", title);
      this.model.set("subtitle", subtitle);
      this.$('#modal-title').val(title);
      this.$('#modal-subtitle').val(subtitle);
    }
  },

  reseedToolbars: function () {
    $('#title p').before(this.insertToolbar({ type: "title" }));
    $('#subtitle p').before(this.insertToolbar({ type: "subtitle" }));
    $('#body p').before(this.insertToolbar({ type: "" }));
    $('#title').focus();
    this.model.destroy();
  },

  submitForm: function (event) {
    event.preventDefault();
    var formData = this.$('.confirm-form').serializeJSON();
    this.model.set("title", formData.story.title);
    this.model.set("subtitle", formData.story.subtitle);
    this.model.save(this.model.attributes, {
      success: function () {
        var tags = $('#tags-select').find('.selectivity-multiple-selected-item');
        if (tags.first().text() !== "") {
          ttags = this.ttags;
          story = this.model
          var ids = [];
          tags.each(function () {
            tag = ttags.findWhere({ label: $(this).text() })
            if (tag === undefined) {
              tag = new Large.Models.Tag({ label: $(this).text()});
              tag.save(tag.attributes, {
                success: function () {
                  // ids.push(tag.id);
                  // ttags.add(tag, { merge: true })
                  var tagging = new Large.Models.Tagging({
                    taggable_id: story.id,
                    taggable_type: "Story",
                    tag_id: tag.id
                  });
                  tagging.save(tagging.attributes);
                }
              })
            } else {
              ids.push(tag.id);
            }
          })
          ids.forEach( function (i) {
            var tagging = new Large.Models.Tagging({
              taggable_id: story.id,
              taggable_type: "Story",
              tag_id: i
            });
            tagging.save(tagging.attributes);
          })
        }
        this.collection.add(this.model, { merge: true });
        $('.navbar').find('.new-story-header').remove();
        $('body').removeClass('modal-open');
        Backbone.history.navigate("stories/" + this.model.id, { trigger: true })
      }.bind(this)
    })
  }
});
