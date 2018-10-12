// Maintain Comments
var Functions = $.import ("HSE.Investigation_Tool.XSLib","Util");
var dummy = 0;//For the fields which are not mapped
var ReqBody = $.request.body.asString();
ReqBody = JSON.parse(ReqBody);
//Test one file
//Second comment added for the branch
var conn = $.hdb.getConnection();

try
{	
	var Attach_query = "INSERT INTO \"HSE\".\"HSE.Investigation_Tool.Tables::ATTACHMENTS\" VALUES (?,?,?,?,?,?,?,?,?)";
	var i=0;
	
	for (i = 0;i < ReqBody.Attachments.length; i++)
	{
		
		conn.executeUpdate(
				Attach_query,
				Functions.nextVal('COMNTS_ATTACH'),
				ReqBody.Attachments[i].TSK_DBID,
				ReqBody.Attachments[i].INV_DBID,
				ReqBody.Attachments[i].FileType,
				ReqBody.Attachments[i].FileName,			
				ReqBody.Attachments[i].DocumentID,
				ReqBody.Attachments[i].FileSize,
				ReqBody.Attachments[i].Url,
				ReqBody.Attachments[i].CreatedDate
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

//{"TSK_DBID":"1","INV_DBID":"101","Comments":"Install Monkey Ladder","CreatedDate":"101","CreatedTime":"101"}

