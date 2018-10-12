// To create or update the Investigation Report


//Variable Declaration
var investigation_query;
var section1_query;
var section2_query;
var section37_query;
var section5_query;
var section6_query;
var tasks_query;
var i;
var taskID;
var task_dbid;
var WfId = 0;
var conn;
var task_query;
var WfBody;
var wfResponse;

//Import the UTIL library
var library = $.import("HSE.Investigation_Tool.XSLib","Util");

var pstmt;

//Read the input values from the Input payload
var input = {};
 input = JSON.parse($.request.body.asString());
 var mode = input.Mode;
var section1 = input.SECTION1;
var section2 = input.SECTION2;
var section3_7 = input.SECTION3_7;
var section5 = input.SECTION5;
var section6 = input.SECTION6;
var tasks = input.TASKS;
var inc_nat_dbid;
// ********** //
  
var seq_id;

//Local Function
function UpdateTask(StatusID,WfInstanceId,TSK_DBID)
{
	var Tsk_query = "UPDATE \"HSE\".\"HSE.Investigation_Tool.Tables::TASKS\" set \"StatusID\" = ?,\"WfInstanceId\" = ? where TSK_DBID = ?";
	conn.executeUpdate(
			Tsk_query,
			StatusID,
			WfInstanceId,
			TSK_DBID);
	conn.commit();
	//Update WF
}


//Based on Mode check whether Create or Update Operation
// If  Mode = I, then Create, If Mode = U, then Update

try{
	conn = $.hdb.getConnection();

//Investigation Report Creation by Investigation Lead
if (mode === 'I'){
	
//	//Update the Investigation Header table and set the status as Pending for Review
	investigation_query = 'UPDATE "HSE"."HSE.Investigation_Tool.Tables::INVESTIGATIONS" set "StatusID" = ? where "INV_DBID" = ?';
	conn.executeUpdate(
	investigation_query,
	input.StatusID,
	input.INV_DBID
	);
	
	//Insert values into Section1 table;
	for (i=0; i<section1.length; i++){
	section1_query = 'INSERT INTO "HSE"."HSE.Investigation_Tool.Tables::SECTION1" VALUES (?,?,?)';
	conn.executeUpdate(
			section1_query,
			library.nextVal('INVSTGTNS'),
	        input.INV_DBID,
	        section1[i].INC_NAT_DBID
	 );
	}
	
	
	//Insert values into Section2 table;
	for (i=0; i<section2.length; i++){
	section2_query = "INSERT INTO \"HSE\".\"HSE.Investigation_Tool.Tables::SECTION2\" VALUES (?,?,?)";
	conn.executeUpdate(
			section2_query,
			library.nextVal('INVSTGTNS'),
			input.INV_DBID,
			section2[i].CF_DBID
			);
	}
	
	
	//Insert values into Section3 table;
	section37_query = "INSERT INTO \"HSE\".\"HSE.Investigation_Tool.Tables::SECTION3_7\" VALUES (?,?,?,?)";
	conn.executeUpdate(
			section37_query,
			library.nextVal('INVSTGTNS'),
			input.INV_DBID,
		section3_7.AdditionalInfo,
			section3_7.IncidentSummary
			);
	
	
	//Insert values into Section5 table;
	for (i=0; i<section5.length; i++){
		section5_query = "INSERT INTO \"HSE\".\"HSE.Investigation_Tool.Tables::SECTION5\" VALUES (?,?,?)";
		conn.executeUpdate(
				section5_query,
				library.nextVal('INVSTGTNS'),
				input.INV_DBID,
				section5[i].RC_DBID
				);
		}
	
	
//	//Insert values into Tasks and Section6 table;
	for (i=0; i<tasks.length; i++){
		task_dbid = library.nextVal('INVSTGTNS');
		taskID = "#TID" + task_dbid;
		tasks_query = "INSERT INTO \"HSE\".\"HSE.Investigation_Tool.Tables::TASKS\" VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
		conn.executeUpdate(
			tasks_query,
				task_dbid,		
				input.INV_DBID,
				tasks[i].CF_DBID,
			    tasks[i].RC_DBID,
			    taskID,
				tasks[i].TaskTitle,
				tasks[i].TaskDesc,
				tasks[i].TaskStatus,
				tasks[i].InvLeadID,
				tasks[i].InvTeamMembID,
				tasks[i].DueDate,
				tasks[i].Type, // It should be Normal or Smart Recommendation Tasks
				WfId,
				tasks[i].CreatedDate
		);	
		
   //// Insert the values into Section 6 table
	  section6_query = "INSERT INTO \"HSE\".\"HSE.Investigation_Tool.Tables::SECTION6\" VALUES (?,?,?,?)";
	  conn.executeUpdate(
				section6_query,
				library.nextVal('INVSTGTNS'),
				input.INV_DBID,
				section6[i].RC_DBID,
				task_dbid
				);
	  
	  /// Trigger the workflow ///
	   
	  WfBody = {
			  "definitionId" : "investigation_approval_process",
	             "context" : {
	                       "incNo" : "1234" ,
	                        "incTitle" : "ABCD",
	                        "eventDesc" :"Test",
	                           "fieldIncManagerId" : "P001012",
	                           "fieldIncManagerEmail" : "suryateja@incture.com",
	                           "fieldIncManagerName":"test",
	                            "incApproverName" : "TestincApproverName1",
	                             "incApproverId" : "TestincApproverId1",
	                             "incApproverEmail" : "TestincApproverEmail1@test.com",
	                              "invLeadName" : "TestincLeadName1",
	                              "invLeadId" : "TestincLeadId1",
	                              "invLeadEmail" : "TestincLeadEmail1@test.com"
	}
	};

	   wfResponse=library.TriggerWorkFlow(WfBody);
	   
	 /// End of workflow ///
	   
  /// If workflow is succesfully triggered, update the tasks table with the workflow instance id ///
	   
	  if (wfResponse.statusCode === 201){
		   WfId = wfResponse.wfInstanceId;
		   UpdateTask(input.StatusID,WfId,task_dbid);
	  }
	  
	}
	
	}


//Investigation Report Updation by Incident Approver or Field Incident Manager
else if(mode === 'U'){
	conn = $.hdb.getConnection();
	investigation_query = "UPDATE \"HSE\".\"HSE.Investigation_Tool.Tables::INVESTIGATIONS\" set \"StatusID\" = ? where INV_DBID = ?";
	conn.executeUpdate(
			investigation_query,
			input.StatusID,
			input.INV_DBID);
}

conn.commit();
}

catch(e){
	$.response.setBody(JSON.stringify(e.message));
	$.response.contentType = 'application/json';
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	conn.rollback();
}

finally 
{  
	
	//Functions.close([conn]);
	
	library.close([conn]);
	  
	   $.response.status = $.net.http.OK;
	   $.response.setBody(JSON.stringify("Success"));
	   $.response.contentType = 'application/json';
}









