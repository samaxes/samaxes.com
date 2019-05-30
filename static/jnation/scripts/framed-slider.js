var JNationFramedSlider=function(){"use strict";return function(e){var o=0;!function n(){console.log("Changing frame source to ".concat(e[o].source)),document.querySelector("iframe").src=e[o].source,window.setTimeout(function(){++o>=e.length&&(o=0),n()},e[o].timeout)}()}}();
//# sourceMappingURL=framed-slider.js.map
