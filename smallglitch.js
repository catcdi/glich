$( function() {
		$( ".glitch-img" ).mgGlitch({
	  destroy : false, 
          glitch: true, 
          scale: true, 
          blend : true, 
          blendModeType : 'hue',
          glitch1TimeMin : 10, 
          glitch1TimeMax : 100,
          glitch2TimeMin : 10, 
          glitch2TimeMax : 300, 
		});
});