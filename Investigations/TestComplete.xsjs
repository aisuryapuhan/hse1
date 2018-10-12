var Functions = $.import ("HSE.Investigation_Tool.XSLib","Util");


var workflowid;
var userid = {id:'P001010'};


	var request;
	var response;
	
	var execution_logs;
	var i;
	var record = {};
	var users= [];
	var taskInstanceId;
	var output = {};
	var flag;
	
	
// 	var body = {
// "status" : "COMPLETED"
// } ;
	
var destination = $.net.http.readDestination("HSE.Investigation_Tool.Investigations","complete");
var client = new $.net.http.Client();
function getCSRF()
{
	try{
		//GET Operation on the base odata URL
		request = new $.web.WebRequest($.net.http.GET,"/xsrf-token");
		//X-CSRF-Token header will be set with value Fetch
		request.headers.set("X-CSRF-Token", "Fetch");
		client.request(request,destination);
		response = client.getResponse();
		//reading the token from response header
		return response.headers.get("X-CSRF-Token").toString();
	}
	catch(errorObj){
		$.response.setBody(JSON.stringify({
			ERROR : errorObj.message
		}));
		return "CSRF TOKEN FETCH FAILED : " + errorObj.message;
	}
}

	var CSRF = getCSRF();
	//Specifying the entity name for the POST operation
	 request = new $.web.WebRequest($.net.http.GET,"/workflow-instances/405494c4-cd51-11e8-a110-00163e717b14/execution-logs");
	try{
		//Setting the token header
		request.headers.set("x-csrf-token",CSRF);
		//Application content type
		request.headers.set("Content-Type","application/json");
		request.headers.set("X-Requested-With","XMLHttpRequest");
		//setting the data to be created
	//	request.setBody(JSON.stringify(body));
		client.request(request, destination);
		response = client.getResponse();
		execution_logs = JSON.parse(response.body.asString());
		
		for (i=0;i<execution_logs.length;i++){
		    record = execution_logs[i];
		    if (record.type === 'USERTASK_CREATED'){
		      users = record.recipientUsers;
		    }
		}
	}
	catch(eee){
	    $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	    $.response.setBody(JSON.stringify(eee.message));
	}
// 	response = client.getResponse();
	 $.response.setBody(JSON.stringify(users));
	 $.response.contentType = 'application/json';
	 $.response.status = $.net.http.OK;