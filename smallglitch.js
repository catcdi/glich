$( function() {
		$( ".glitch-img" ).mgGlitch({
	  destroy : false, 
          glitch: true, 
          scale: true, 
          blend : true, 
          blendModeType : 'hue',
          glitch1TimeMin : 100, 
          glitch1TimeMax : 1000,
          glitch2TimeMin : 100, 
          glitch2TimeMax : 3000, 
		});
});