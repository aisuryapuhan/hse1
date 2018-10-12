var get_query;
var get_stmt;
var get_result;

var conn;

var destination_package;
var destination_name;
var dest;
var client;
var csrfToken;


var Incidents = {INVESTIGATIONHEADERTODASHNAV:[]};
var record = {};

var status = 6; //Approved Status
var pendingStatus = 4; //Pending Status
var req;
var response;
var i; //Loop Variable


var inv_query;
var inv_stmt;
var inv_result;
var ODataResponse;

var InvestigationDetails = {
    newIncidents:[],
    pendingIncidents:[]
};



var pendingIncidents = {pendingIncidents:[]};

var fieldIncidentManager = $.request.parameters.get('fieldIncidentManager');//Read the Input parameter

/***** Function to Fetch the CSRF Token *******/
function csrf(destination_package, destination_name){
    dest = $.net.http.readDestination(destination_package, destination_name);
    client = new $.net.http.Client();
    req = new $.web.WebRequest($.net.http.GET, "/$metadata");
    req.headers.set("SAP-Connectivity-SCC-Location_ID", "houston");
    req.headers.set("X-CSRF-Token", "Fetch");
    client.request(req, dest);
    response = client.getResponse();
   return response.headers.get("X-CSRF-Token").toString();
}

try{
	conn = $.db.getConnection();
	get_query = 'SELECT * FROM "HSE"."HSE.Investigation_Tool.Tables::INVESTIGATIONS" where "HSE.Investigation_Tool.Tables::INVESTIGATIONS"."StatusID" !=' +status;
	get_stmt = conn.prepareStatement(get_query);
	get_result = get_stmt.executeQuery();
	
	while (get_result.next()){
		record.Incidentid = get_result.getString(2);
		Incidents.INVESTIGATIONHEADERTODASHNAV.push(record);
		record = {};
	}
	
	
/*******Get the List of Incidents with status as pending for the given field incident manager ****/	
	/****** Data is retrieved from the HANA tables *********/
	

	inv_query = 'SELECT * FROM "HSE"."HSE.Investigation_Tool.Tables::INVESTIGATIONS" WHERE "HSE.Investigation_Tool.Tables::INVESTIGATIONS"."StatusID" =' +pendingStatus + ' and "HSE.Investigation_Tool.Tables::INVESTIGATIONS"."FldIncMngrUsrID" =' +fieldIncidentManager;

	inv_stmt = conn.prepareStatement(inv_query);
	inv_result = inv_stmt.executeQuery();
	
	while(inv_result.next()){
		
		record.CreatedTime = inv_result.getString(12);
		record.Incidentid = inv_result.getString(2);
		record.Status = pendingStatus;
		record.Title = inv_result.getString(3);
		record.Department = inv_result.getString(4);
		record.Createdby = inv_result.getString(9);
		record.Locationtext = inv_result.getString(5);
		record.Hipo = inv_result.getString(6);
		record.Severity = inv_result.getString(16);
		record.Riskscore = inv_result.getString(7);
		record.Createdon = inv_result.getString(11);
		
		InvestigationDetails.pendingIncidents.push(record);
		record = {};
	}
	
/************************ End *****************************/	

/**************  Call the OData Post Service to get the list of incidents ***********************/
	
	destination_package = 'HSE.Investigation_Tool.Investigations';
	destination_name = 'Incidents';
	dest = $.net.http.readDestination(destination_package, destination_name);
    client = new $.net.http.Client();

csrfToken = csrf(destination_package,destination_name);

req = new $.web.WebRequest($.net.http.POST, "/InvestigationHeaderSet");//Entity Set 
req.headers.set("SAP-Connectivity-SCC-Location_ID", "houston");
req.headers.set("X-CSRF-Token", csrfToken);
req.setBody(JSON.stringify(Incidents));
req.headers.set("Content-Type","application/json");
req.headers.set("Accept","application/json");
client.request(req, dest);
response = client.getResponse();

/************************ End of OData Post Call  *****************************************/


/******* Merge the output from OData Post Call and data 
                                 retrieved from HANA tables*********/

ODataResponse = response.body.asString();

var oResponse = JSON.parse(ODataResponse);

var results = oResponse.d.INVESTIGATIONHEADERTODASHNAV.results;

for(i=0; i<results.length; i++){
	record.Createdtime = results[i].Createdtime;
	record.Createdbyid = results[i].Createdbyid;
	record.Incidentid = results[i].Incidentid;
	record.Status = 1;
	record.Title = results[i].Title;
	record.Department = results[i].Department;
	record.Createdby = results[i].Createdby;
	record.Locationtext = results[i].Locationtext;
	record.Hipo = results[i].Hipo;
	record.Severity = results[i].Severity;
	record.Riskscore = results[i].Riskscore;
	record.Createdon = results[i].Createdon;
	InvestigationDetails.newIncidents.push(record);
	record = {};
}


  



/************** Print the output **********************/
 $.response.setBody(JSON.stringify(InvestigationDetails));
$.response.contentType = "application/json";
$.response.status = $.net.http.OK;
	
}
catch(e){
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	$.response.setBody(e.message);
	$.response.contentType = 'application/json';
}
finally{
	conn.close();
}

