(function (ImageGrid,$,EventDispatcher) {



  ImageGrid.PlacingZone = function (width,height,orientation,fragments) {

    const that= this;

    this.width= width;
    this.height = height;
    this.orientation = orientation;

    this.appendTo = function ($container) {

      let topOffset=0;
      let leftOffset=0;
      let bottomOffset=0;
      let rightOffset=0;
      let top=0;
      let left=0;
      const margin=8;


      this.$zone= $('<div class="placing-zone" style="height:'+height+'px; width:'+width+'px">'+orientation+'</div>').appendTo($container);
      fragments.forEach(function (element) {
        if (element !== 0) {
          element.appendTo(that.$zone);
          switch (that.orientation) {
            case 'L':
              left=0;
              top= leftOffset*(element.fHeight+margin);
              leftOffset++;
              break;
            case 'R':
              left=0;
              top= rightOffset*(element.fHeight+margin);
              rightOffset++;
              break;
            case 'T':
              top=0;
              left= topOffset*(element.fWidth+margin);
              topOffset++;
              break;
            case 'B':
              top=0;
              left= bottomOffset*(element.fWidth+margin);
              bottomOffset++;
              break;
          }

          element.$fragment.css({
            'top': top+'px',
            'left': left+'px'
          });

        }
      });
      if (this.orientation === 'L' || this.orientation === 'R') {
        this.$zone.addClass('placing-zone-vertical');
      }
      else {
        this.$zone.addClass('placing-zone-horizontal');
      }
    };




  }




  ImageGrid.PlacingZone.prototype = Object.create(EventDispatcher.prototype);
  ImageGrid.PlacingZone.prototype.constructor = ImageGrid.Fragment;


  return ImageGrid.PlacingZone;
})(H5P.ImageGrid,H5P.jQuery,H5P.EventDispatcher);
