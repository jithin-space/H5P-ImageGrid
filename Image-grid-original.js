H5P.ImageGrid = (function ($, UI) {


  function ImageGrid(params, id) {
    //constructor

    var self = this;
    var gridSrcImage = H5P.getPath(params.image.path, id);
    var imageOrientation, screenOrientation;
    var gameMode = [];
    var imageFragments = [];
    var orderedFragments = [];
    var fragmentsToMatch = [];
    var finalHolders = [];
    var score = 0;
    var MIN_IMAGE_WIDTH = 600;
    var MIN_IMAGE_HEIGHT = 300;
    var gameLevel = parseInt(params.levels);

    var getImageOrientation = function () {

      if (params.image.width >= params.image.height) {
        return 'landscape';
      }
      else {
        return 'portrait';
      }
    };

    var getScreenOrientation = function () {
      if (window.matchMedia("(orientation: portrait)").matches) {
        return 'portrait';
      }

      if (window.matchMedia("(orientation: landscape)").matches) {
        return 'landscape';
      }

    };

    imageOrientation = getImageOrientation();
    screenOrientation = getScreenOrientation();
    gameMode = [imageOrientation, screenOrientation];

    var setContainerOrientation = function ($container) {

      if (imageOrientation == 'landscape') {
        $container.find('div').addClass('container-landscape');
        if (MIN_IMAGE_WIDTH >= params.image.width) {
          $container.find('img').width(MIN_IMAGE_WIDTH + 'px');
        }
      }
      else {
        $container.find('div').addClass('container-portrait');
        if (params.image.height < MIN_IMAGE_HEIGHT) {
          $container.find('img').height(MIN_IMAGE_HEIGHT + 'px');
        }
      }

    };

    var getFragmentsToUse = function (width, height) {

      for (var i = 0; i < gameLevel; i++) {
        for (var j = 0; j < gameLevel; j++) {

          var fragment = new ImageGrid.Fragment(params.image, id, i, j, gameLevel, width, height);
          imageFragments.push(fragment);
        }
      }

      orderedFragments = imageFragments.slice();
      fragmentsToMatch = imageFragments.slice();
      H5P.shuffleArray(imageFragments);

    };

    var createGridOverImage = function ($container, width, height) {

      var fragmentWidth = Math.floor(width / gameLevel);
      var fragmentHeight = Math.floor(height / gameLevel);
      var $canvasContainer = $('<canvas class="grid-canvas" width="' + width + '" height="' + height + '">');
      $canvasContainer.css('background-image', 'url("' + gridSrcImage + '")');
      $container.html($canvasContainer);
      var context = $canvasContainer[0].getContext("2d");
      context.strokeStyle = "#cccccc";
      context.lineWidth = 2;

      for (var i = 0; i < gameLevel; i++) {

        for (var j = 0; j < gameLevel; j++) {

          context.rect(j * fragmentWidth, i * fragmentHeight, fragmentWidth, fragmentHeight);
          context.stroke();

        }
      }

    };

    var createFragmentHolders = function (level, fragmentWidth, fragmentHeight) {
      var holderContainer = [];
      var droppableContainer = [];
      for (var i = 0; i < level; i++) {
        for (var j = 0; j < level; j++) {
          var $holder = $('<div />');
          $holder.css('height', (fragmentHeight) + 'px');
          $holder.css('width', (fragmentWidth) + 'px');
          $holder.css('top', (i * fragmentHeight + (i * 2)) + 'px');
          $holder.css('left', (j * fragmentWidth + (j * 2)) + 'px');
          //it is fragment container
          if ((i == 0 || i == level - 1) || (j == 0 || j == level - 1)) {
            $holder.addClass('holder-container');
            holderContainer.push($holder);
          }
          // it is a droppable container
          else {
            $holder.addClass('droppable-container');
            var droppableId = (i - 1) * (level - 2) + (j - 1);
            $holder.data('id', droppableId);
            droppableContainer.push($holder);
          }


        }
      }
      if (((level - 1) * 4) < gameLevel * gameLevel) {
        var rqdSecondaryHolders = (gameLevel * gameLevel) - ((level - 1) * 4);
        var secondLevelHolders = createExtraHolders(level - 1, fragmentWidth, fragmentHeight);
        H5P.shuffleArray(secondLevelHolders);
        holderContainer = holderContainer.concat(secondLevelHolders.slice(0, rqdSecondaryHolders));
      }

      return [holderContainer, droppableContainer];
    };

    var createExtraHolders = function (level, fragmentWidth, fragmentHeight) {

      var holderContainer = [];

      for (var i = 0; i < level; i++) {
        for (var j = 0; j < level; j++) {
          var $fragmentContainer = $('<div class="secondary-holder-container"/>');
          $fragmentContainer.css('height', (fragmentHeight) + 'px');
          $fragmentContainer.css('width', (fragmentWidth) + 'px');
          if (i == 0 || i == level - 1) {
            $fragmentContainer.css('top', (i * fragmentHeight + (i * 2) + ((i / (level - 1)) * fragmentHeight)) + 'px');
            $fragmentContainer.css('left', (j * fragmentWidth + (j * 2) + (fragmentWidth / 2)) + 'px');
          }
          else if (j == 0 || j == level - 1) {
            $fragmentContainer.css('top', (i * fragmentHeight + (i * 2) + (fragmentHeight / 2)) + 'px');
            $fragmentContainer.css('left', (j * fragmentWidth + (j * 2) + ((j / (level - 1)) * fragmentWidth)) + 'px');
          }
          holderContainer.push($fragmentContainer);
        }
      }
      return holderContainer;
    };

    var createGameBoard = function ($container, width, height) {

      $container.empty();
      $gameHeaderContainer = $('<div class="game-header-container" />').appendTo($container);
      $timerContainer = $('<div class="timer-container" ><button><span class="h5p-time-spent"> 0:00 </span> </button> </div>').appendTo($gameHeaderContainer);
      $headerButtonContainer = $('<div class="header-button-container" > <button class="preview" >Preview Solution</button>\
    <button class="shuffle"> Shuffle Pieces </button ></div>').appendTo($gameHeaderContainer);
      $playAreaContainer = $('<div class="play-area-container" />').appendTo($container);

      self.timer = new ImageGrid.Timer($timerContainer.find('.h5p-time-spent')[0]);

      $headerButtonContainer.find('.preview').on('click', function () {
        if ($(this).hasClass('active')) {
          $playAreaContainer.find('.droppable-container .li-class').css('visibility', 'hidden');
          $(this).html('Preview Solution').removeClass('active');

        }
        else {
          $playAreaContainer.find('.droppable-container .li-class').css('visibility', 'visible');
          $(this).html('Hide Solution').addClass('active');
        }

      });

      $headerButtonContainer.find('.shuffle').on('click', function () {

        console.log(fragmentsToMatch.length);
        console.log(finalHolders.length);
        H5P.shuffleArray(fragmentsToMatch);

        for (var i = 0; i < finalHolders.length; i++) {
          finalHolders[i].empty();
          fragmentsToMatch[i].appendTo(finalHolders[i]);
        }
      });
      var fragmentWidth = Math.floor(width / gameLevel);
      var fragmentHeight = Math.floor(height / gameLevel);

      // hard coded 20...need to remove


      getFragmentsToUse(fragmentWidth, fragmentHeight);

      if (gameMode[1] === 'landscape') {
        // place the images around the container;

        var margin = ($container.width() - fragmentWidth * (gameLevel + 2)) / 2;
        $playAreaContainer.css('margin-left', margin + 'px');
        $playAreaContainer.css('height', ((gameLevel + 2) * fragmentHeight + 40) + 'px');

        var holders = [];
        var firstLevelHolders = [];
        var secondLevelHolders = [];
        // increment the level by 2 for placing the fragments around the grid
        var level = gameLevel + 2;
        holders = createFragmentHolders(level, fragmentWidth, fragmentHeight);
        var fragmentHolders = holders[0];
        finalHolders = holders[0].splice(0, gameLevel * gameLevel);
        for (var i = 0; i < gameLevel; i++) {
          for (var j = 0; j < gameLevel; j++) {
            var $fragmentContainer = finalHolders[(i * gameLevel + j)];
            var $droppableContainer = holders[1][(i * gameLevel + j)];
            imageFragments[(i * gameLevel + j)].appendTo($fragmentContainer);

            $fragmentContainer.appendTo($playAreaContainer);
            orderedFragments[(i * gameLevel + j)].appendTo($droppableContainer);
            $droppableContainer.appendTo($playAreaContainer);
            $fragmentContainer.draggable({

              start: function () {
                self.timer.play();
                $playAreaContainer.find('.ui-droppable').addClass('droppable-active');
                $playAreaContainer.find('.dropped').addClass('scale-element');
              },

              revert: function () {
                if ($(this).hasClass('drag-revert')) {
                  $(this).removeClass('drag-revert');
                  return true;
                }
                //for proper reverting
                else if (!($(this).hasClass('dropped'))) {
                  return true;
                }

              },
              stop: function () {
                $playAreaContainer.find('.drag-over').removeClass('drag-over');
                $playAreaContainer.find('.ui-droppable').removeClass('droppable-active');
                $playAreaContainer.find('.dropped').removeClass('scale-element');
                console.log('dragend');
              }


            });
            $droppableContainer.droppable({

              over: function () {
                $(this).addClass('drag-over');
              },
              out: function () {
                $(this).removeClass('drag-over');
              },

              drop: function (event, ui) {

                var droppableId = $(this).data('id');
                var draggableId = ui.draggable.find('.li-class').data('id');
                if (droppableId != draggableId) {
                  return ui.draggable.addClass('drag-revert');
                }
                ui.draggable.position({
                  my: "center",
                  at: "center",
                  of: $(this)
                });

                for (var i = fragmentsToMatch.length; i--;) {
                  if (fragmentsToMatch[i].fragmentId === draggableId) {
                    fragmentsToMatch.splice(i, 1);
                  }
                }

                for (var i = finalHolders.length; i--;) {
                  if (finalHolders[i].find('.li-class').data('id') === draggableId) {
                    finalHolders.splice(i, 1);
                  }
                }


                $(this).droppable("option", "disabled", true);
                $(this).removeClass('ui-droppable').removeClass('droppable-active');

                ui.draggable.addClass('dropped');

                score++;

                if (score == (gameLevel * gameLevel)) {
                  gameFinished($container);
                }
                else {
                  console.log(gameLevel * gameLevel);
                }
              }
            });
          }
        }

        H5P.trigger('resize');
      }


    };

    var gameFinished = function ($container) {

      var timeSpent = $container.find('.h5p-time-spent').html();

      $container.empty();
      var $gameContainer = $('<div class="game-container"><img src="' + gridSrcImage + '"/></div>').appendTo($container);
      setContainerOrientation($container);
      imageWidth = $container.find('img').width();
      imageHeight = $container.find('img').height();
      // var fragmentWidth = Math.floor(imageWidth/gameLevel);
      // var fragmentHeight = Math.floor(imageHeight/gameLevel);
      // var $canvasContainer = $('<canvas class="grid-canvas" width="'+imageWidth+'" height="'+imageHeight+'">');
      // $canvasContainer.css('background-image','url("'+gridSrcImage+'")');
      // $canvasContainer.appendTo($container);


      $('<div class="final-status-container"><h1> Puzzle Completed ! </h1> <h3> Time Spent : ' + timeSpent + ' </h3> </div>').appendTo($container);


      $retryPuzzleButtonContainer = $('<div class = "retry-button-container" > </div>').appendTo($container);

      var $retryPuzzleButton = UI.createButton({
        title: 'Button',
        'text': 'Retry',
        click: function () {
          retryPuzzle($container);
        },

      }).appendTo($retryPuzzleButtonContainer);


    };

    var retryPuzzle = function ($container) {
      score = 0;
      imageFragments = [];
      gameLevel = parseInt(params.levels);
      $container.empty();
      self.attach($container);
    };

    var containerOrientation = function ($container) {
      if ($container.width() > $container.height()) {
        return "landscape";
      }
      else {
        return "portrait";
      }

    };

    console.log(gameMode);

    // all code goes here

    // self.attach = function($container){
    //
    //   console.log($container.width());
    //   var imageWidth,imageHeight;
    //
    //   var $gameContainer = $('<div class="game-container"><img src="'+gridSrcImage+'"/></div>').appendTo($container);
    //   $container.addClass('h5p-image-grid');
    //   setContainerOrientation($container);
    //   imageWidth=$container.find('img').width();
    //   imageHeight= $container.find('img').height();
    //   createGridOverImage ($gameContainer,imageWidth,imageHeight);
    //
    //
    //   if(params.chooseDifficulty==='true'){
    //
    //     var $difficultyContainer = $('<div class="difficulty-container"><div class="difficulty-label"> Difficulty: </div>\
    //     <div  class="difficulty-selector"><select><option value="3">9 Pieces</option> \
    //     <option value="4">16 Pieces</option>\
    //     <option value="5">25 Pieces</option>\
    //     <option value="6">36 Pieces</option>\
    //     <option value="7">49 Pieces</option></select></div></div>');
    //     $container.append($difficultyContainer);
    //
    //   $difficultyContainer.find('option[value='+params.levels+']').attr('selected','selected');
    //
    //     $difficultyContainer.find('select').on('change', function(){
    //       gameLevel= parseInt(this.value);
    //       createGridOverImage ($gameContainer,imageWidth,imageHeight);
    //     });
    //
    //   }
    //
    //
    //
    //
    //   var $startPuzzleButtonContainer = $('<div class="start-puzzle-button-container"></div>').appendTo($container);
    //
    //   var $startPuzzleButton = UI.createButton({
    //     title: 'Button',
    //     'text': 'Start The Puzzle',
    //     click: function(){
    //       createGameBoard($container,imageWidth,imageHeight);
    //     },
    //
    //   }).appendTo($startPuzzleButtonContainer);
    //
    //
    //   self.trigger('resize');
    // }
    var fitGridPattern = function ($container) {

      var $overlayContainer=$container.find('.overlay');
      var $imageContainer=$container.find('.srcImage');

      var fittingOrientation = containerOrientation($overlayContainer);

      var containerWidth = $overlayContainer.width();
      var containerHeight = $overlayContainer.height();
      var patternSplit = parseInt(gameLevel) / 2;

      var expectedHeight = (params.image.height / params.image.width) * containerWidth;
      var expectedWidth = (params.image.width / params.image.height) * containerHeight;
      var marginLeft;
      var marginRight;
      var patternWidth;
      var patternHeight;
      var patternSpreadWidth;
      var patternSpreadHeight;
      if (gameMode[0] === "landscape") {
        //both are landscape
        // calculate the image height


        if (expectedHeight <$overlayContainer.height()) {

          marginLeft = ($imageContainer.width() - (containerWidth)) / 2;
          marginTop = ($overlayContainer.height() - (expectedHeight)) / 2;
          patternSpreadWidth = $imageContainer.width();
          patternSpreadHeight = expectedHeight;


        }
        else {

          marginLeft = ($overlayContainer.width() - (expectedWidth)) / 2;
          marginTop = ($imageContainer.height() - (containerHeight)) / 2;
          patternSpreadHeight = $imageContainer.height();
          patternSpreadWidth = expectedWidth;


        }
      }
      else {
        //image is portrait
        if (expectedWidth < $overlayContainer.width()) {
          marginLeft = ($overlayContainer.width() - (expectedWidth)) / 2;
          marginTop = ($imageContainer.height() - (containerHeight)) / 2;
          patternSpreadWidth = expectedWidth;
          patternSpreadHeight = $imageContainer.height();
        }
        else {
          marginLeft = ($imageContainer.width() - (containerWidth)) / 2;
          marginTop = ($overlayContainer.height() - (expectedHeight)) / 2;
          patternSpreadWidth = $imageContainer.width();
          patternSpreadHeight = expectedHeight;
        }

      }

      $overlayContainer.css({
        "margin-left": (marginLeft > 0) ? marginLeft : 0,
        "margin-top": (marginTop > 0) ? marginTop : 0,
        "background-size": patternSpreadWidth / patternSplit + "px " + patternSpreadHeight / patternSplit + "px",
        "width": patternSpreadWidth,
        "height": patternSpreadHeight
      });

    };

    ImageGrid.prototype.attach = function ($container) {

      $container.addClass('h5p-image-grid');
      var $initContainer = $('<div class="initContainer"></div>').appendTo($container);

      var $imageContainer = $('<div class="initImageContainer">\
    <div class="backgroundContainer"><img id="srcImage" class="srcImage" src="' + gridSrcImage + '" />\
    </div></div>').appendTo($initContainer);

      var $optionContainer = $('<div class="overlayContainer" >\
    <div class="overlay" width="' + $('.srcImage').width() + 'px" height="' + $('.srcImage').height() + 'px"></div>\
    </div>').appendTo($imageContainer);

      // var fittingOrientation = containerOrientation($('.overlay'));

      // option container elements
      if (params.chooseDifficulty === 'true') {

        var $difficultyContainer = $('<div class="difficulty-container"><div class="difficulty-label"> Difficulty</div>\
        <div  class="difficulty-selector"><select><option value="3">9 Pieces</option> \
        <option value="4">16 Pieces</option>\
        <option value="5">25 Pieces</option>\
        <option value="6">36 Pieces</option>\
        <option value="7">49 Pieces</option></select></div></div>');

        var $fullScreenCheckBox = $('<div class="checkbox-container"><input type="checkbox" /><span class="checkmark"></span><label>Full Screen</label></div>');

        var $startPuzzleButtonContainer = $('<div class="start-puzzle-button-container"></div>');

        var $startPuzzleButton= UI.createButton({
          title: 'Button',
          'text': 'Start the puzzle',
          click: function () {
            // createGameBoard($container,imageWidth,imageHeight);
          },

        }).appendTo($startPuzzleButtonContainer);


        $difficultyContainer.find('option[value='+gameLevel+']').attr('selected','selected');

				  $difficultyContainer.find('select').on('change', function () {
				    gameLevel= parseInt(this.value);
				    self.trigger('resize');
          console.log(gameLevel);
				  });

      }


      var $optionContainer = $('<div class="initOptionContainer"></div>');
      $fullScreenCheckBox.appendTo($difficultyContainer);
      $startPuzzleButtonContainer.appendTo($difficultyContainer);
      $difficultyContainer.appendTo($optionContainer);


      $optionContainer.appendTo($initContainer);

      //first phase of editi

      fitGridPattern($container);

      var delay = (function () {
        var timer = 0;
        return function (callback, ms) {
          clearTimeout (timer);
          timer = setTimeout(callback, ms);
        };
      })();

      this.on('resize',function () {
        delay(function () {
          $container.empty();
          self.attach($container);
        }, 100);

      });





    };

  }


  return ImageGrid;
})(H5P.jQuery, H5P.JoubelUI);
