//::::::::::::::::::::::::::::::::::::To close the DB Connections
function close(closables) {  
	var closable;  
	var i;  
	for (i = 0; i < closables.length; i++) {  
		closable = closables[i];  
		if(closable) {  
			closable.close();  
		}  
	}  
}
//::::::::::::::::::::::::::::::::::::To close the DB Connections

//:::::::::::::::::::::::::::::::::::::Next Value From the Sequence
function nextVal(sequence)
{
	var conn = $.db.getConnection();
	var seq_query = 'SELECT "HSE"."'+sequence+'".NEXTVAL FROM DUMMY';
	var seq_stmt = conn.prepareStatement(seq_query);
	var rs_seq = seq_stmt.executeQuery();
	while (rs_seq.next()) {	return rs_seq.getString(1);}
	close([conn]);
}
//:::::::::::::::::::::::::::::::::::::Next Value From the Sequence



//::::::::::::::::::::::::::::::::::::: WF XSRF Token ::::::::::::::::::::::::::::::::::::::

var destination = $.net.http.readDestination("HSE.Investigation_Tool.XSLib","workflowDestHSE");
var client = new $.net.http.Client();
function getCSRF()
{
	var request;
	var response;

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
//::::::::::::::::::::::::::::::::::::: WF XSRF Token ::::::::::::::::::::::::::::::::::::::

//::::::::::::::::::::::::::::::::::::::: Trigger WF ::::::::::::::::::::::::::::::::::::::
function TriggerWorkFlow(body){

//	Get XSRF Token
	var CSRF = getCSRF();
	//Specifying the entity name for the POST operation
	var request = new $.web.WebRequest($.net.http.POST,"/workflow-instances");
	try{
		//Setting the token header
		request.headers.set("x-csrf-token",CSRF);
		//Application content type
		request.headers.set("Content-Type","application/json");
		request.headers.set("X-Requested-With","XMLHttpRequest");
		//setting the data to be created
		request.setBody(JSON.stringify(body));
		client.request(request, destination);
		var response = client.getResponse();
		var statusCode = response.status;
		if (statusCode === 201)//Check for Created
		{
			return ({
				statusCode: statusCode,
				wfInstanceId:  JSON.parse(response.body.asString()).id,
				wfStartedBy: JSON.parse(response.body.asString()).startedBy,
				wfStartedAt: JSON.parse(response.body.asString()).startedAt
			});
		}
		else
		{ 
			return (
					{statusCode:500,ErrMsg:JSON.parse(response.body.asString())	}
					
					);
			}

	}
	catch(eee){
		return "Error:"+eee.message;
	}
}
//::::::::::::::::::::::::::::::::::::::: Trigger WF ::::::::::::::::::::::::::::::::::::::

//::::::::::::::::::::::::::::::::::::::: Send Push Notification ::::::::::::::::::::::::::::::::
function SendNotification(alertText,LoginName)
{	
		var users = [];
		users.push(LoginName);
	try{  
		var body = {
				"notification":
				{	
					"alert": alertText,
			        "badge": 1,
			        "sound": "soundval"
				},
				"users":users
		};     

		var dest = $.net.http.readDestination("HSE.Investigation_Tool.XSLib","pushnotification");
		var client = new $.net.http.Client();
		var req = $.net.http.Request($.net.http.POST, "/user");
		req.headers.set("Content-Type","application/json");
		req.headers.set("Accept","application/json");
		req.setBody(JSON.stringify(body));
		client.request(req, dest);
		var response1 = client.getResponse();
		$.response.setBody(response1.body.asString());
	}
	catch(e){
		$.response.contentType = "application/json";
		$.response.setBody(e.message);
	}
}
//::::::::::::::::::::::::::::::::::::::: Send Push Notification ::::::::::::::::::::::::::::::::

//::::::::::::::::::::::::::::::::::::::: Get Person Details ::::::::::::::::::::::::::::::::
function GetPersonData(PER_DBID)
{
	var conn = $.db.getConnection();
	var seq_query = 'SELECT  "UserID","FName","Lname","FullName","Email","SAPID","LoginName" FROM "HSE"."HSE.Investigation_Tool.Tables::PERSONS" WHERE PER_DBID = '+PER_DBID+'';
	var seq_stmt = conn.prepareStatement(seq_query);
	var rs_seq = seq_stmt.executeQuery();

	if (!rs_seq.next()) {
		$.response.setBody( "Failed to retrieve data" );
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		
	}
	else {		
			return ({ 
				"UserID":rs_seq.getString(1),
				"FName":rs_seq.getString(2),
				"Lname":rs_seq.getString(3),
				"FullName":rs_seq.getString(4),
				"Email":rs_seq.getString(5),
				"SAPID":rs_seq.getString(6),
				"LoginName":rs_seq.getString(7)
			});
		
	}

	close([conn]);
}
//::::::::::::::::::::::::::::::::::::::: Get Person Details ::::::::::::::::::::::::::::::::


//function getTaskId(workflowid, userid){
//	var Token = getCSRF();
//	var url = "/workflow-instances" + workflowid + '/execution-logs';
//	var request = new $.web.WebRequest($.net.http.GET,url);
//	    //Setting the token header
//		request.headers.set("x-csrf-token",Token);
//		//Application content type
//		request.headers.set("Content-Type","application/json");
//		request.headers.set("X-Requested-With","XMLHttpRequest");
//		//setting the data to be created
//		client.request(request, destination);
//		var response = client.getResponse();
//		return response;
//}
