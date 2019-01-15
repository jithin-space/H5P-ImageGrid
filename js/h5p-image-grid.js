H5P.ImageGrid = (function ($,UI) {

  /**
   * ImageGrid - Description
   *
   * @param {type} options Description
   * @param {type} id      Description
   * @param {type} extras  Description
   *
   * @returns {type} Description
   */
  // TODO : update documentation
  function ImageGrid(options,id) {

    this.options = $.extend(true,{
      levels: '3',
      id: id,
      chooseDifficulty: true,
      image: null
    },options);

    H5P.EventDispatcher.call(this);

    this.gridSrcImage = H5P.getPath(this.options.image.path,id);
    this.gameMode = [getImageOrientation(this.options.image),getScreenOrientation()];
    this.gameLevel = parseInt(this.options.levels);
    this.registerDOMElements();

  }

  ImageGrid.prototype = Object.create(H5P.EventDispatcher.prototype);
  ImageGrid.prototype.constructor = ImageGrid;
  // prototype functions will go here.


  ImageGrid.prototype.registerDOMElements = function () {

    const that = this;

    this.$overlayContainer=$('<div class="overlay-container" >\
    <div class="overlay" ></div>\
    </div>');

    if (this.options.chooseDifficulty) {
      this.$difficultySelectContainer = $('<div class="difficulty-container"><div class="difficulty-label"> Difficulty</div>\
      <div  class="difficulty-selector"><select><option value="3">9 Pieces</option> \
      <option value="4">16 Pieces</option>\
      <option value="5">25 Pieces</option>\
      <option value="6">36 Pieces</option>\
      <option value="7">49 Pieces</option></select></div></div>');
    }

    this.$fullScreenCheckBox = $('<div class="checkbox-container"><input type="checkbox" /><span class="checkmark"></span><label>Full Screen</label></div>');

    this.$startPuzzleButton = UI.createButton({
      title: 'Button',
      text: 'Start the puzzle',
      class: 'start-puzzle-button',
      click: function () {
        that.gotoPlayArea();
      }
      // TODO: handle fullscreen functionality
      // TODO : semantics for this text
    });

    this.$difficultySelectContainer.on('change',function (e) {
      that.gameLevel = parseInt(e.target.value);
      that.fitGridPattern();
    });

    // play area elements

    this.$statusContainer = $('<div class="status-container"></div>');

    this.$timerContainer = $('<div class="timer-container"></div>');

    this.$timer = $('<div/>',{
      class: 'time-status',
      tabindex: 0,
      html: '<span role="term" ><i class="fa fa-clock-o" ></i>'
       +'</span >&nbsp;<span role="definition"  class="h5p-time-spent" >0:00</span>'
    });
    this.timer = new ImageGrid.Timer(this.$timer.find('.h5p-time-spent'));



    this.$buttonContainer = $('<div class="button-container"></div>');

    this.$shuffleButton = UI.createButton({
      title: 'Button',
      html: '<span><i class="fa fa-random" aria-hidden="true"></i></span>&nbsp;Shuffle Pieces',
      class:'status-button',
      click: function () {
        //TODO : functionality
      }
      // TODO : semantics for button text
    });

    this.$showSolutionButton = UI.createButton({
      title: 'Button',
      html: '<span><i class="fa fa-eye" aria-hidden="true"></i></span>&nbsp;Show Solution',
      class: 'status-button',
      click: function () {
        //TODO: add functionality
      }
      // TODO : semantics for button text
    });

    this.$playArea = $('<div class="playArea"></div>');



  };

  ImageGrid.prototype.gotoPlayArea = function () {
    this.$container.empty();
    this.$timer.appendTo(this.$statusContainer);

    this.$shuffleButton.appendTo(this.$buttonContainer);
    this.$showSolutionButton.appendTo(this.$buttonContainer);
    this.$buttonContainer.appendTo(this.$statusContainer);
    this.$statusContainer.appendTo(this.$container);

    this.$playArea.appendTo(this.$container);




    this.preparePlayArea();
  };

  ImageGrid.prototype.preparePlayArea = function () {
    this.setPlayAreaParams();
    // TODO: name context should check
    this.placeZonesToPlayArea();


  };

  ImageGrid.prototype.setPlayAreaParams = function () {

    const that = this;
    this.fZone = [];

    if (this.gameMode[0] === 'landscape' && this.gameMode[1]=== 'landscape') {
      // TODO: 4 side mode
      const fragmentsPerZone = {'3':3,'4':4,'5':4,'6':5,'7':7};
      this.fragmentZonesCount = Math.ceil(this.gameLevel/4)*4;
      this.fragmentsPerZone = fragmentsPerZone[this.gameLevel];
    }
    else {
      // TODO: 2 side mode
      this.fragmentZonesCount = Math.ceil(this.gameLevel/2)*2;
      this.fragmentsPerZone = this.gameLevel;
    }

    let numberOfFragments = this.gameLevel*this.gameLevel;
    this.initializeFragments();
    let iterationCycle = 0;

    this.fZone = new Array(this.fragmentZonesCount).fill(0).map(function (element,index1) {
      return new Array(that.fragmentsPerZone).fill(0);
    });

    //H5P.shuffleArray(this.fragments);


    while (numberOfFragments > 0) {
      for (let i=0; i < this.fragmentZonesCount; i++) {
        if (numberOfFragments <= 0 ) {
          break;
        }
        this.fZone[i][iterationCycle]= new ImageGrid.Fragment(that.options.image,that.options.id,numberOfFragments,that.fragmentWidth,that.fragmentHeight,that.gameLevel);
        numberOfFragments--;
      }
      iterationCycle++;
    }
  };

  ImageGrid.prototype.placeZonesToPlayArea = function () {
    if (this.gameMode[0]=== 'landscape' && this.gameMode[1]=== 'landscape') {
      //TBLR
      this.placingMode = ['T','B','L','R'];
      this.playAreaRow = this.playAreaCol =  this.gameLevel+ (this.fragmentZonesCount/4);
    }
    else if ( this.gameMode[0]=== 'portrait' ) {
      //LR
      this.placingMode = ['L','R'];
      this.playAreaRow= this.gameLevel;
      this.playAreaCol= this.gameLevel + (this.fragmentZonesCount);
    }
    else {
      //TB
      this.placingMode = ['T','B'];
      this.playAreaCol= this.gameLevel;
      this.playAreaRow= this.gameLevel + (this.fragmentZonesCount);
    }

    this.registerGridElements();
  };


  ImageGrid.prototype.registerGridElements = function () {

    // Need to find the logic

    let segmentPerDirection = this.fragmentZonesCount/this.placingMode.length;
    const that = this;
    //TODO: need to calculate responsively

    // const cellHeight = that.$playArea.height()/that.playAreaRow;
    const cellHeight = that.fragmentHeight;
    const cellWidth =  that.fragmentWidth;
    this.placingZones = [];
    let zoneHeight = 0;
    let zoneWidth = 0;
    let orientation = '';

    this.placingMode.forEach(function (orientation,index) {
      let spd= segmentPerDirection;
      switch (orientation) {
        case 'L':
          zoneHeight = cellHeight*that.playAreaRow;
          zoneWidth = cellWidth;
          orientation = 'L';
          break;
        case 'R':
          zoneHeight = cellHeight*that.playAreaRow;
          zoneWidth = cellWidth;
          orientation = 'R';
          break;
        case 'T':
          zoneWidth = cellWidth*that.playAreaCol;
          zoneHeight = cellHeight;
          orientation = 'T';
          break;
        case 'B':
          zoneWidth = cellWidth*that.playAreaCol;
          zoneHeight = cellHeight;
          orientation = 'B';
          break;
      }



      while (spd > 0) {
        // TODO: Next Day
        that.placingZones.push(new ImageGrid.PlacingZone(zoneWidth,zoneHeight,orientation,that.fZone[index]));
        spd--;
      }

    });

    let leftArea = this.placingZones.filter(function (zone) {
      return zone.orientation === 'L';
    });

    let rightArea = this.placingZones.filter(function (zone) {
      return zone.orientation === 'R';
    });

    let topArea = this.placingZones.filter(function (zone) {
      return zone.orientation === 'T';
    });

    let bottomArea = this.placingZones.filter(function (zone) {
      return zone.orientation === 'B';
    });


    if (topArea.length > 0) {
      topArea.forEach(function (zone) {
        zone.appendTo(that.$playArea);
      });
    }

    if (leftArea.length > 0) {
      leftArea.forEach(function (zone) {
        zone.appendTo(that.$playArea);
      });
    }

    //place Image

    // let imageHeight= (this.playAreaRow-(topArea.length+bottomArea.length))*cellHeight;
    // let imageWidth = (this.playAreaCol-(leftArea.length+rightArea.length))*cellWidth;

    let imageHeight= (this.gameLevel)*cellHeight;
    let imageWidth = (this.gameLevel)*cellWidth;

    //TODO: landscape & portrait complication checking to be done
    let $imageDiv = $('<div class="placing-image-container" style="height:'+imageHeight+'px;width:'+imageWidth+'px"></div>').appendTo(that.$playArea);
    // need to calculate height;
    $imageDiv.css({
      'background-image': 'url('+H5P.getPath(this.gridSrcImage)+')'
    });

    if (rightArea.length > 0) {
      rightArea.forEach(function (zone) {
        zone.appendTo(that.$playArea);
      });
    }

    if (bottomArea.length > 0) {
      bottomArea.forEach(function (zone) {
        zone.appendTo(that.$playArea);
      });
    }

  };


  ImageGrid.prototype.initializeFragments = function () {

    this.fragments = [];
    for (let i=0; i<this.gameLevel; i++) {
      for (let j=0; j<this.gameLevel; j++) {
        this.fragments.push('Fragment'+ (i*this.gameLevel+j));
      }
    }

    H5P.shuffleArray(this.fragments);

  };
  ImageGrid.prototype.fitGridPattern = function () {

    const $srcImage =  this.$initImageContainer.find('#srcImage');
    const $overlay = this.$initImageContainer.find('.overlay');
    const containerWidth = $overlay.width();
    const containerHeight = $overlay.height();
    const patternSplit = this.gameLevel/2;
    const aspRatio= this.options.image.width/this.options.image.height;

    const expHeight = containerWidth/aspRatio;
    const expWidth = containerHeight*aspRatio;

    let marginLeft = 0;
    let marginTop = 0;
    let patternSpreadHeight = 0;
    let patternSpreadWidth = 0;

    if (this.gameMode[0] === 'landscape') {
      if (expHeight < containerHeight) {
        marginLeft = ($srcImage.width() - containerWidth)/2;
        marginTop =  ($overlay.height()- expHeight)/2;
        patternSpreadWidth = $srcImage.width();
        patternSpreadHeight = expHeight;
      }
      else {
        marginLeft = ($overlay.width() - expWidth)/2;
        marginTop = ($srcImage.height() - containerHeight)/2;
        patternSpreadHeight = $srcImage.height();
        patternSpreadWidth = expWidth;

      }
    }
    else {
      if (expWidth < $overlay.width()) {
        marginLeft = ($overlay.width()- expWidth)/2;
        marginTop = ($srcImage.height() - containerHeight)/2;
        patternSpreadWidth = expWidth;
        patternSpreadHeight = $srcImage.height();
      }
      else {
        marginLeft = ($srcImage.width() - containerWidth) / 2;
        marginTop =  ($overlay.height() - expHeight) / 2;
        patternSpreadWidth = $srcImage.width();
        patternSpreadHeight = expHeight;
      }

    }

    this.fragmentWidth = patternSpreadWidth/this.gameLevel;
    this.fragmentHeight= patternSpreadHeight/this.gameLevel;

    $overlay.css({
      'margin-left': (marginLeft > 0)? marginLeft: 0,
      'margin-top': (marginTop > 0)? marginTop: 0,
      'background-size': patternSpreadWidth/patternSplit+'px '+patternSpreadHeight/patternSplit + 'px',
      'width': patternSpreadWidth,
      'height': patternSpreadHeight
    });



  };
  ImageGrid.prototype.attach = function ($container) {

    const that = this;

    $container.addClass('h5p-image-grid');
    this.$initImageContainer = $('<div class="init-image-container"><div class="bg-container"><img id="srcImage" src="'+this.gridSrcImage+'"</div></div>');
    this.$optionsContainer = $('<div class="options-container"></div>');



    if (this.$difficultySelectContainer) {
      this.$difficultySelectContainer.appendTo(this.$optionsContainer);
      this.$difficultySelectContainer.find('option[value='+this.gameLevel+']').attr('selected','selected');
    }
    this.$fullScreenCheckBox.appendTo(this.$optionsContainer);
    this.$startPuzzleButton.appendTo(this.$optionsContainer);


    this.$initImageContainer.appendTo($container);
    this.$optionsContainer.appendTo($container);

    this.$overlayContainer.find('.overlay').css({
      'width': that.$initImageContainer.find('#srcImage').width()+'px',
      'height': that.$initImageContainer.find('#srcImage').height()+'px'
    });

    this.$overlayContainer.appendTo(this.$initImageContainer);

    this.fitGridPattern();

    this.$container = $container;

    const delay = (function () {
      let timer = 0;
      return function (callback, ms) {
        clearTimeout (timer);
        timer = setTimeout(callback, ms);
      };
    })();

    this.on('resize',function () {
      delay(function () {
        that.$overlayContainer.find('.overlay').css({
          'width': that.$initImageContainer.find('#srcImage').width()+'px',
          'height': that.$initImageContainer.find('#srcImage').height()+'px'
        });
        that.fitGridPattern();
      }, 1000);

    });
  };

  const getContainerOrientation = function ($container) {
    return ($container.width() > $container.height())?'landscape':'portrait';
  }

  const getScreenOrientation = function () {
    return (window.matchMedia("(orientation: portrait)").matches)? 'portrait':'landscape';
  };

  const getImageOrientation = function (image) {
    return (image.width>=image.height)?'landscape':'portrait';

  }


  return ImageGrid;
})(H5P.jQuery,H5P.JoubelUI);
