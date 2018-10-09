// Assignment of Investigation Lead by Field Incident Manager

var Functions = $.import ("HSE.Investigation_Tool.XSLib","Util");
var dummy = 0;//For the fields which are not mapped
var ReqBody = $.request.body.asString();
ReqBody = JSON.parse(ReqBody);
//Check the Mode
var mode = ReqBody.Mode;// Should Be Insert or Update

try
{	
	
	
	if (mode === 'I')
	{
		var Inv_query = "INSERT INTO \"HSE\".\"HSE.Investigation_Tool.Tables::INVESTIGATIONS\" VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
		var conn = $.hdb.getConnection();
		conn.executeUpdate(
				Inv_query,
				Functions.nextVal('INVSTGTNS'),	
				ReqBody.IncidentNo,
				ReqBody.Title,
				ReqBody.Department,
				ReqBody.Location,
				ReqBody.Hipo,
				ReqBody.RiskScore,
				ReqBody.InvLeadID,
				ReqBody.FldIncMngrUsrID,
				ReqBody.StatusID,
				ReqBody.CreatedDate,
				ReqBody.CreatedTime,
				ReqBody.System,
				ReqBody.DeviceId,
				ReqBody.DeviceType,
				ReqBody.Severity);
	}
	else
	{
		var Inv_query = "UPDATE \"HSE\".\"HSE.Investigation_Tool.Tables::INVESTIGATIONS\" set \"StatusID\" = ? where INV_DBID = ?";
		var conn = $.hdb.getConnection();
		conn.executeUpdate(
				Inv_query,
				ReqBody.StatusID,
				ReqBody.INV_DBID);
	}
	
		
		
	//------------Commit to DB--------------------//
	
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
///////////////////////////////////// Insert
//{	"IncidentNo":"991",
//	"Title":"101",
//	"Department":"101",
//	"Location":"PID",
//	"Hipo":"101",
//	"RiskScore":"101",
//	"InvLeadID":"1",
//	"FldIncMngrUsrID":"1",
//	"StatusID":"1",
//	"CreatedDate":"20180927",
//	"CreatedTime":"00:00:00",
//	"System":"D",
//	"DeviceId":"20180927",
//	"DeviceType":"20180927",
//	"Mode":"I"
//}
///////////////////////////////////// Update
//{
//	"StatusID":"2",
//	"INV_DBID":"2",
//	"Mode":"U"
//}

