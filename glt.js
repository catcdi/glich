$( function() {
		$( ".glitch-img" ).mgGlitch({
          // set 'true' to stop the plugin
				  destroy : false, 
          // set 'false' to stop glitching
          glitch: true, 
          // set 'false' to stop scaling
          scale: true, 
          // set 'false' to stop glitch blending
          blend : true, 
          // select blend mode type
          blendModeType : 'hue',
          // set min time for glitch 1 elem
          glitch1TimeMin : 100, 
          // set max time for glitch 1 elem
          glitch1TimeMax : 500,
          // set min time for glitch 2 elem
          glitch2TimeMin : 100, 
          // set max time for glitch 2 elem
          glitch2TimeMax : 1000, 
		});
});
