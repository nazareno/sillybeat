// THE SOUND CLASS
function Sound(context,searchparameters){

	var that = this;
	this.loaded = false;
	this.context = context;
	this.buffer = null;
	this.url = null;
	this.request;
	//get sounds from soundcloud
	SC.get('/tracks',searchparameters,function(tracks){
		
		var random = Math.floor(Math.random() * tracks.length); //choose a random one
		
		//make the url and prepare it for proxying
		var url = tracks[random].stream_url + '?client_id=e553081039dc6507a7c3ebf6211e4590';
		that.url = 'http://localhost:8080/' +  url;
		
		//load the buffer - decode it and return buffer
		that.request = new XMLHttpRequest();
		that.request.open('GET', that.url, true);
		that.request.responseType = "arraybuffer";

		that.request.onload = function(){
			that.context.decodeAudioData(that.request.response, function(b){
				that.buffer = b;
				that.loaded = true;
				console.log(that.buffer);
			},function(){
				console.log('decode failed');
			});
		};

		that.request.send();
		
	},function(){
		//get failed
		console.log('get failed');
	});

	return this.buffer;
}

//play method
Sound.prototype.start = function(next,offset){
	
	//create the buffer
	
};

Sound.prototype.stop = function(time){
	

};