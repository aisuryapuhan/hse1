// Maintain Comments
var Functions = $.import ("HSE.Investigation_Tool.XSLib","Util");
var dummy = 0;//For the fields which are not mapped
var ReqBody = $.request.body.asString();
ReqBody = JSON.parse(ReqBody);

try
{	
	var Comments_query = "INSERT INTO \"HSE\".\"HSE.Investigation_Tool.Tables::COMMENTS\" VALUES (?,?,?,?,?,?,?)";
	var conn = $.hdb.getConnection();
		conn.executeUpdate(
			Comments_query,
			Functions.nextVal('COMNTS_ATTACH'),
			ReqBody.TSK_DBID,
			ReqBody.INV_DBID,
			ReqBody.Comments,
			ReqBody.CreatedDate,			
			ReqBody.CreatedTime,
			ReqBody.AddedById//It should be the Team Members DBID
			);	
		
	
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

//{"TSK_DBID":"1","INV_DBID":"101","Comments":"Install Monkey Ladder","CreatedDate":"101","CreatedTime":"101"}

