var generateParameters = function(query,a_user,durationFrom,durationTo){
    var year = 2000 + Math.floor(Math.random() * 4) + 10;
    var month = Math.floor(Math.random() * 11) + 1;
    var day = Math.floor(Math.random()* 30);
    if(day < 10){
        day = "0" + day;
    }
    if(month < 10){
        month = "0" + month;
    }
    var date = year + "-" + month + "-" + day + " 12:03:04"
	var parameters = {

//		duration:{
//			from: durationFrom,
//			to: durationTo
//		},

        limit: 50,
        q: query,
    }

    if(a_user != null && a_user != ""){
        parameters.user_id = a_user;
    }

	return parameters;
};