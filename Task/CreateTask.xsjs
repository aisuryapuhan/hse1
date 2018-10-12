//Create Task for Data Gathering
var Functions = $.import ("HSE.Investigation_Tool.XSLib","Util");
var dummy = 0;//For the fields which are not mapped
var WfId = 0;
var WfStatusCode = 0;
var ReqBody = JSON.parse($.request.body.asString());
var Mode = ReqBody.Mode;
var conn = $.hdb.getConnection();
var taskdbid = Functions.nextVal('TASK');
//Check the Mode
//var mode = ReqBody.Mode;// Should Be Insert or Update

try
{	
	if(Mode === "I")// Its Insert
	{

		//-----------------------Task Header Item-------------------//

		//var taskID = "#TID"+taskdbid;
		var taskID = taskdbid;//Removed the Prefix
		var Task_query = "INSERT INTO \"HSE\".\"HSE.Investigation_Tool.Tables::TASKS\" VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
		conn.executeUpdate(
				Task_query,
				taskdbid,		
				ReqBody.INV_DBID,
				ReqBody.CF_DBID,
				ReqBody.RC_DBID,
				taskID,//ReqBody.TaskID,
				ReqBody.Title,
				ReqBody.Desc,
				ReqBody.StatusID,
				ReqBody.InvLeadID,
				ReqBody.InvTeamMembID,
				ReqBody.DueDate,
				ReqBody.Type, // It should be Normal or Smart Recommendation Tasks
				WfId,
				ReqBody.CreatedDate
		);

		//-----------------------Comments -------------------//

		var Comments_query = "INSERT INTO \"HSE\".\"HSE.Investigation_Tool.Tables::COMMENTS\" VALUES (?,?,?,?,?,?,?)";
		var i=0;
		for (i = 0;i < ReqBody.Comments.length; i++)
		{
			conn.executeUpdate(
					Comments_query,
					Functions.nextVal('COMNTS_ATTACH'),
					taskdbid,
					ReqBody.Comments[i].INV_DBID,
					ReqBody.Comments[i].Comments,
					ReqBody.Comments[i].CreatedDate,			
					ReqBody.Comments[i].CreatedTime,
					ReqBody.InvLeadID //Here Comments is Added by The Investigation Lead at the time of Task Creation

			);
		}

//		-----------------------Attachments -------------------//

		var Attach_query = "INSERT INTO \"HSE\".\"HSE.Investigation_Tool.Tables::ATTACHMENTS\" VALUES (?,?,?,?,?,?,?,?,?)";
		var i=0;
		for (i = 0;i < ReqBody.Attachements.length; i++)
		{
			conn.executeUpdate(
					Attach_query,
					Functions.nextVal('COMNTS_ATTACH'),
					taskdbid,
					ReqBody.Attachements[i].INV_DBID,
					ReqBody.Attachements[i].FileType,
					ReqBody.Attachements[i].FileName,			
					ReqBody.Attachements[i].DocumentID,
					ReqBody.Attachements[i].FileSize,
					ReqBody.Attachements[i].Url,
					ReqBody.Attachements[i].CreatedDate
			);
		}

	}//Insert Block
	else if(Mode === "U")//Update Block
	{

		UpdateTask(ReqBody.StatusID,ReqBody.WfInstanceId,ReqBody.TSK_DBID);

	}

	conn.commit();
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

	//Functions.close([conn]);
	if($.response.status === 200 && Mode === 'I')// Means Insert Is success
	{
		//Push Notification will Be triggered
		var alertText = "Task : " +taskID+" is assigned for your action";
		Functions.SendNotification(alertText,ReqBody.InvTeamMembLoginName);
		//Get Investigation Team Member Data
		var persondata;
		persondata = Functions.GetPersonData(ReqBody.InvTeamMembID);
		//============================Trigger WorkFlow
		var wfBody = {

				"definitionId" : "smart_recommendation_data_gathering_process",
				"context" : { "taskId" : taskID,
					           "invTeamMemberEmail" : persondata.Email,
					            "invTeamMemberName" : persondata.FullName,
					          "invTeamMemberId" : persondata.UserID	
					}
		
	};
	var wfResponse=Functions.TriggerWorkFlow(wfBody);
	WfId =wfResponse.wfInstanceId;
	if(wfResponse.statusCode === 201) //WF triggered
	{			
		UpdateTask(ReqBody.StatusID,WfId,taskdbid);
		$.response.contentType = 'application/json';
		//$.response.setBody(JSON.stringify(e.message));
		$.response.setBody(JSON.stringify(
				{
					"TaskId" : taskID,				
					"Success": "Task is Created and Workflow is triggered.",
					"Code": $.response.status,
					"WFMessage" : wfResponse

				}
		));

	}
}
	
	else if ($.response.status === 200 && Mode === 'U')// Means Update  Is success
		{
		//Update WF should be Triggred
		$.response.contentType = 'application/json';
		$.response.setBody(JSON.stringify(
				{
							
					"Success": "Task and Workflow is Updated.",
					"Code": $.response.status
				

				}
		));
		
		}
	
	
Functions.close([conn]);	
}

//Local Function
function UpdateTask(StatusID,WfInstanceId,TSK_DBID)
{
	var Tsk_query = "UPDATE \"HSE\".\"HSE.Investigation_Tool.Tables::TASKS\" set \"StatusID\" = ?,\"WfInstanceId\" = ? where TSK_DBID = ?";
	conn.executeUpdate(
			Tsk_query,
			StatusID,
			WfInstanceId,
			TSK_DBID
			);
	conn.commit();
	//Update WF
}




//Payload Structure.

//{

//"INV_DBID ":"101","CF_DBID":"101","RC_DBID":"101","TaskID":"PID","Title":"101","Desc":"101","StatusID":"I","InvLeadID":"","InvTeamMembID":"","DueDate":"","Type":""


//"Comments" : [	{"TSK_DBID " : "101","INV_DBID":"","Comments":"","CreatedDate":"","CreatedTime":""},	
//{"TSK_DBID " : "101","INV_DBID":"","Comments":"","CreatedDate":"","CreatedTime":""}	],
//,
//"Attachements" : [	{"TSK_DBID " : "101","INV_DBID":"","FileType":"","FileName":"","DocumentID":"","FileSize":""},	
//{"TSK_DBID " : "101","INV_DBID":"","FileType":"","FileName":"","DocumentID":"","FileSize":""}	],
//}


