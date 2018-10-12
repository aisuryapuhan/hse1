// Maintaining Person Details from User Provisioning while Create/Update
var Functions = $.import ("HSE.Investigation_Tool.XSLib","Util");
var dummy = 0;//For the fields which are not mapped
var ReqBody = $.request.body.asString();
ReqBody = JSON.parse(ReqBody);
var person = [];
//Check the Mode
var mode = ReqBody.Mode;// Should Be Insert or Update

//Prepare the Structure for Insert Query.
var i=0;
for (i = 0;i < ReqBody.Roles.length; i++)
{
	person.push({"ROLE_DBID":ReqBody.Roles[i].ROLE_DBID,"UserID":ReqBody.UserID,
		"FName":ReqBody.FName,"Lname":ReqBody.Lname,"FullName":ReqBody.FullName,
		"Email":ReqBody.Email,"SAPID":ReqBody.SAPID,"LoginName":ReqBody.LoginName});
	}



try
{	
	var Person_query = "INSERT INTO \"HSE\".\"HSE.Investigation_Tool.Tables::PERSONS\" VALUES (?,?,?,?,?,?,?,?,?)";
	var conn = $.hdb.getConnection();
	var i=0;
	for (i = 0;i < person.length; i++)
	{
	conn.executeUpdate(
			Person_query,
			Functions.nextVal('PERSON'),
			person[i].ROLE_DBID,
			person[i].UserID,
			person[i].FName,
			person[i].Lname,
			person[i].FullName,
			person[i].Email,
			person[i].SAPID,
			person[i].LoginName
			
			);	
	}	
	
	conn.commit();
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify(
			{
				"Success": "Success",
				"Code": $.response.status
			}
	));
	
}
catch(e)
{
	$.response.contentType = "application/json";
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	$.response.setBody(JSON.stringify(e.message));
	conn.rollback();
}
finally 
{  
	Functions.close([conn]);
}
//Payload Structure.

//
//{
//"UserID":"PID","FName":"101","Lname":"101","FullName":"101","Email":"101","SAPID":"101","Mode":"I",
//"Roles" : [	{"ROLE_DBID" : "101"},	
//			{"ROLE_DBID" : "111"}
//			]
//}
