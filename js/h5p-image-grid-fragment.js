(function (ImageGrid,$,EventDispatcher) {



  ImageGrid.Fragment = function (image,contentId,id,fWidth,fHeight,level) {

    const that = this;
    EventDispatcher.call(that);
    that.fragmentId = id;
    that.bWidth = Math.floor(image.width/level);
    that.bHeight = Math.floor(image.height/level);
    that.backgroundXPosition = Math.floor(id%level)*that.bWidth;
    that.backgroundYPosition= Math.floor(id/level)*that.bHeight;

    this.appendTo = function ($container) {
      that.$fragment = $('<div class="li-class" data-id = "'+ self.fragmentId +'"></div>')
        .css('background-image','url(' + H5P.getPath(image.path,contentId) + ')')
        .css('background-position',(-that.backgroundXPosition)+'px '+ (-that.backgroundYPosition)+'px ')
        .css('height',that.bHeight+'px')
        .css('width',that.bWidth+'px');
      that.$fragment.css('transform','scale('+fWidth/that.bWidth+','+fHeight/that.bHeight+')');
      // that.$fragment.css('transform-origin','0px 0px');
      that.$fragment.appendTo($container);
    }


  }




  ImageGrid.Fragment.prototype = Object.create(EventDispatcher.prototype);
  ImageGrid.Fragment.prototype.constructor = ImageGrid.Fragment;

  // ImageGrid.Fragment.isValid = function(params) {
  //     return (params !== undefined && params.image !== undefined && params.image.path !== undefined);
  // };

  return ImageGrid.Fragment;
})(H5P.ImageGrid,H5P.jQuery,H5P.EventDispatcher);
