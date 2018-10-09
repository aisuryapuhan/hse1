// To create or update the Investigation Report

//Variable Declaration
var investigation_query;
var section1_query;
var section2_query;
var section37_query;
var section5_query;
var section6_query;
var tasks_query;


//Import the UTIL library
var library = $.import("HSE.Investigation_Tool.XSLib","Util");


//Read the Input payload
var request = $.request.body.asString();


// parse the request as a JSON object
var input = JSON.parse(request);
var conn;


//Based on Mode check whether Create or Update Operation
// If  Mode = I, then Create, If Mode = U, then Update


try{
conn = $.hdb.getConnection();

//Investigation Report Creation by Investigation Lead
if (input.Mode === 'I'){

	//Update the Investigation Header table and set the status as Pending for Review
	investigation_query = "UPDATE \"HSE\".\"HSE.Investigation_Tool.Tables::INVESTIGATIONS\" set \"StatusID\" = ? where INV_DBID = ?";
	conn.executeUpdate(
			investigation_query,
			input.StatusID,
			input.INV_DBID);
	
	//Insert values into Section1 table
	
}

//Investigation Report Updation by Incident Approver or Field Incident Manager
else if(input.Mode === 'U'){
	investigation_query = "UPDATE \"HSE\".\"HSE.Investigation_Tool.Tables::INVESTIGATIONS\" set \"StatusID\" = ? where INV_DBID = ?";
	conn.executeUpdate(
			investigation_query,
			input.StatusID,
			input.INV_DBID);
}
}
catch(e){
	$.response.setbody(JSON.stringify(e.message));
	$.response.contentType = 'application/json';
	$.response.status = 'INTERNAL_SERVER_ERROR';
	conn.rollback();
}

finally{
	library.close([conn]);
}



