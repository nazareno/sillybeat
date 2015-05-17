var generateKickPattern = function(probability, probs){
    var array = [];
    for(var i =0; i < 16; i++){
        var random = Math.random() <= probability * probs[i % 8];

        //the higher the probability - the lower the chance
        if(random == true){
            array[i] = true;
        }
    }
    console.log("kick: " + array)
    return array;
}

var generatePattern = function(probability){
	var array = [];
	for(var i =0; i < 16; i++){
		if(Math.random() <= probability){
			array[i] = true;
		}
	}
	return array;
};

var generateOffsetPattern = function(){
	var array = [];
	for(var i =0; i < 8; i++){
		array[i] = Math.min(1, 0.2 + Math.random() * 0.8);
	}
	return array;
};

