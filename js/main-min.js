(function(jQuery){jQuery.fn.uapply=function(options){var matchedObject=this;matchedObject.uconfigurations();matchedObject.utopbar();matchedObject.uscan();var menu=jQuery(".menu")
menu.umenu();var chat=jQuery(".chat")
chat.uchat();var eureka=jQuery(".eureka",matchedObject);eureka.ueureka();var report=jQuery(".report",matchedObject);report.ureport();};})(jQuery);(function(jQuery){jQuery.fn.uconfigurations=function(options){var matchedObject=this;var mvcPath=jQuery("#mvc-path",matchedObject).html();var objectId=jQuery("#object-id",matchedObject).html();var username=jQuery("#username",matchedObject).html();var representation=jQuery("#representation",matchedObject).html();var definitions_s=jQuery("#definitions",matchedObject).html();var alias_s=jQuery("#alias",matchedObject).html();var definitions=jQuery.parseJSON(definitions_s)||{};var alias=jQuery.parseJSON(alias_s)||{};var sections=definitions["sections"]||{};var classIdUrl=definitions["class_id_url"]||{};var paths={};for(name in sections){var section=sections[name];var path=alias[section]||section;paths[name]=path;}
var tagRegex=new RegExp("\%\[[a-z]+\]","g");for(classId in classIdUrl){var url=classIdUrl[classId];while(true){var result=tagRegex.exec(url);if(result==null){break;}
result=result[0];var name=result.slice(2,result.length-1)
var path=paths[name]
url=url.replace(result,path);}
classIdUrl[classId]=url;}
matchedObject.data("mvc_path",mvcPath);matchedObject.data("object_id",objectId);matchedObject.data("username",username);matchedObject.data("representation",representation);matchedObject.data("definitions",definitions);matchedObject.data("alias",alias);matchedObject.data("sections",sections);matchedObject.data("class_id_url",classIdUrl);};})(jQuery);(function(jQuery){jQuery.uquery=function(param){var _body=jQuery("body");var mvcPath=_body.data("mvc_path");if(!mvcPath){throw jQuery.uxexception("No mvc path variable defined");}
var alias=_body.data("alias")||{};var type=param["type"]||"get";var url=param["url"];var data=param["data"];var complete=param["complete"];var success=param["success"];var error=param["error"];var urlSplit=url.split("/");var section=urlSplit[0];var remainder=urlSplit.slice(1);var sectionUrl=alias[section]||section;url=sectionUrl+"/"+remainder.join("/")
url=mvcPath+url;var filters=data["filters"]||[];var _filters=[];for(var index=0;index<filters.length;index++){var filter=filters[index];var name=filter[0];var value=filter.length==3?String(filter[2]):String(filter[1]);var operation=filter.length==3?filter[1]:"equals";var _filter=name+":"+operation+":"+value;_filters.push(_filter);}
data["filters[]"]=_filters;delete data["filters"];jQuery.ajax({type:type,url:url,data:data,complete:complete,success:success,error:error});};})(jQuery);(function(jQuery){jQuery.fn.umenu=function(options){var matchedObject=this;matchedObject.each(function(index,element){var _element=jQuery(this);var _switch=jQuery(".switch",_element);var back=jQuery(".back",_element);_element.bind("show",function(){var element=jQuery(this);var menu=_element;var accountPanel=jQuery(".account-panel",menu);var switchPanel=jQuery(".switch-panel",menu);switchPanel.hide();accountPanel.show();element.uxmenulink("reposition");});_switch.click(function(){var element=jQuery(this);var menu=element.parents(".menu");var accountPanel=jQuery(".account-panel",menu);var switchPanel=jQuery(".switch-panel",menu);accountPanel.hide();switchPanel.show();menu.uxmenulink("reposition");});back.click(function(){var element=jQuery(this);var menu=element.parents(".menu");var accountPanel=jQuery(".account-panel",menu);var switchPanel=jQuery(".switch-panel",menu);accountPanel.show();switchPanel.hide();menu.uxmenulink("reposition");});});return matchedObject;};})(jQuery);(function(jQuery){jQuery.fn.uscan=function(options){var SCAN_CODE_LENGTH=22;var COMPATIBLE_VERSIONS=[1];var matchedObject=this;var _document=jQuery(document);var _body=jQuery("body");_document.bind("scan",function(event,value){var element=jQuery(this);var mvcPath=_body.data("mvc_path");var classIdUrl=_body.data("class_id_url");if(value.length!=SCAN_CODE_LENGTH){return;}
var checksumS=value.slice(0,4);checksumS=parseInt(checksumS);checksumS=String(checksumS);var buffer=value.slice(4);var _checksumS=checksum(buffer);if(_checksumS!=checksumS){return;}
var version=value.slice(4,6);var classId=value.slice(6,10);var objectId=value.slice(10);var versionInt=parseInt(version);if(isNaN(versionInt)){return;}
var classIdInt=parseInt(classId);if(isNaN(classIdInt)){return;}
var objectIdInt=parseInt(objectId);if(isNaN(objectId)){return;}
var isCompatible=COMPATIBLE_VERSIONS.indexOf(versionInt)!=-1;if(!isCompatible){return;}
var classUrl=classIdUrl[classIdInt];if(!classUrl){return;}
event.uscan=true;try{element.triggerHandler("uscan",[versionInt,classIdInt,objectIdInt]);}catch(exception){return;}
var baseUrl=mvcPath+classUrl;objectId=objectId.replace(/^0+|\s+$/g,"");document.location=baseUrl+objectId;});_document.bind("scan_error",function(event,value){});var checksum=function(buffer,modulus,salt){modulus=modulus||10000;salt=salt||"omni";var _buffer=buffer+salt;var counter=0;for(var index=0;index<_buffer.length;index++){var _byte=_buffer[index];var byteI=_byte.charCodeAt(0);counter+=byteI<<index;}
var checksum=counter%modulus;var checksumS=String(checksum);return checksumS;};};})(jQuery);(function(jQuery){jQuery.fn.uchat=function(options){var matchedObject=this;var _window=jQuery(window);var placePanels=function(panels){var windowHeight=_window.height();var windowWidth=_window.width();var extraMargin=14;for(var key in panels){var panel=panels[key];var panelHeight=panel.outerHeight(true);var panelWidth=panel.outerWidth(true);var chatTop=windowHeight-panelHeight;var chatLeft=windowWidth-panelWidth-extraMargin;panel.css("top",chatTop+"px");panel.css("left",chatLeft+"px");extraMargin+=panelWidth+8;}};var updateStatus=function(matchedObject){var _body=jQuery("body");var username=_body.data("username");var url=matchedObject.attr("data-url");jQuery.ajax({type:"get",url:url+"/chat/status.json",success:function(data){for(var _username in data){if(_username==username){continue;}
var userS=data[_username];userS["username"]=_username;createItem(matchedObject,userS);}
matchedObject.data("user_status",data);}});};var createItem=function(matchedObject,data){var budyList=jQuery(".buddy-list",matchedObject);var status=data["status"];var objectId=data["object_id"];var username=data["username"];var representation=data["representation"];var item=jQuery("<li class=\"budy-"+status
+"\" data-user_id=\""+username+"\" data-object_id=\""
+objectId+"\">"+representation+"</li>")
budyList.append(item);item.click(function(){var element=jQuery(this);var name=element.html();var userId=element.attr("data-user_id");var objectId=element.attr("data-object_id");matchedObject.uchatpanel({owner:matchedObject,name:name,user_id:userId,object_id:objectId});});};var dataProcessor=function(data){var jsonData=jQuery.parseJSON(data);var type=jsonData["type"];switch(type){case"message":messageProcessor(jsonData);break;case"status":statusProcessor(jsonData);break;default:break;}};var messageProcessor=function(envelope){var message=envelope["message"];var sender=envelope["sender"];var panel=jQuery(".chat-panel[data-user_id="+sender+"]",matchedObject);if(panel.length==0){var userStatus=matchedObject.data("user_status");var userS=userStatus[sender];var objectId=userS["object_id"];var representation=userS["representation"];panel=matchedObject.uchatpanel({owner:matchedObject,name:representation,user_id:sender,object_id:objectId});}
panel.trigger("restore");panel.uchatline({message:message});var audio=jQuery("> audio",matchedObject);audio[0].play();};var statusProcessor=function(envelope){var _body=jQuery("body");var username=_body.data("username");var status=envelope["status"];var objectId=envelope["object_id"];var _username=envelope["username"];var representation=envelope["representation"];if(username==_username){return;}
var userStatus=matchedObject.data("user_status");var userS=userStatus[_username]||{};userS["status"]=status;userS["object_id"]=objectId;userS["username"]=_username;userS["representation"]=representation;userStatus[_username]=userS;switch(status){case"offline":var item=jQuery(".buddy-list > li[data-user_id="
+_username+"]",matchedObject)
item.remove();break;default:var item=jQuery(".buddy-list > li[data-user_id="
+_username+"]",matchedObject)
if(item.length==0){createItem(matchedObject,envelope);}
item.removeClass("budy-online");item.removeClass("budy-busy");item.removeClass("budy-unavailable");item.addClass("budy-"+status);break;}};matchedObject.each(function(index,element){var _element=jQuery(this);var _body=jQuery("body");var username=_body.data("username");var url=_element.attr("data-url");_element.communication("default",{url:url+"/communication",channels:["chat/"+username],timeout:500,callbacks:[dataProcessor]});_element.bind("stream_connected",function(){});_element.bind("stream_disconnected",function(){_body.uxinfo("The server communication has been disconnected.\\n"
+"Please contact your system administrator using [geral@hive.pt].","Warning","warning");});_element.bind("stream_error",function(){_body.uxinfo("There was an error communicating with the server.\\n"
+"Please contact your system administrator using [geral@hive.pt].","Warning","warning");});var sound=_element.attr("data-sound");var audio=jQuery("<audio src=\""+sound
+"\" preload=\"none\"></audio>");matchedObject.append(audio);updateStatus(_element);});matchedObject.bind("new_chat",function(){var panels=matchedObject.data("panels")||{};placePanels(panels);});matchedObject.bind("delete_chat",function(){var panels=matchedObject.data("panels")||{};placePanels(panels);});_window.resize(function(){var panels=matchedObject.data("panels")||{};placePanels(panels);});};})(jQuery);(function(jQuery){jQuery.fn.uchatpanel=function(options){var matchedObject=this;var owner=options["owner"];var name=options["name"];var userId=options["user_id"];var objectId=options["object_id"];var ownerId=options["owner_id"];var panels=matchedObject.data("panels")||{};var chatPanel=panels[name];if(chatPanel){return;}
chatPanel=jQuery("<div class=\"chat-panel budy-available\">"
+"<div class=\"chat-header\">"+name
+"<div class=\"chat-buttons\">"
+"<div class=\"chat-button chat-settings\"></div>"
+"<div class=\"chat-button chat-close\"></div>"+"</div>"
+"</div>"+"<div class=\"chat-contents\"></div>"
+"<div class=\"chat-message\">"
+"<textarea type=\"text\" class=\"text-area\"></textarea>"
+"</div>"+"</div>");matchedObject.append(chatPanel);chatPanel.uxapply();chatPanel.attr("data-user_id",userId);chatPanel.data("name",name);chatPanel.data("user_id",userId);chatPanel.data("object_id",objectId);chatPanel.data("owner_id",ownerId);var header=jQuery(".chat-header",chatPanel);var contents=jQuery(".chat-contents",chatPanel);var message=jQuery(".chat-message",chatPanel);var buttonClose=jQuery(".chat-close",chatPanel);var buttonMinimize=jQuery(".chat-minimize",chatPanel);var textArea=jQuery(".chat-message > .text-area",chatPanel);chatPanel.bind("minimize",function(){var element=jQuery(this);contents.hide();message.hide();element.triggerHandler("layout",[]);element.data("minimized",true);});chatPanel.bind("restore",function(){var element=jQuery(this);contents.show();message.show();setTimeout(function(){textArea.focus();});element.triggerHandler("layout",[]);element.data("minimized",false);});chatPanel.bind("layout",function(){var element=jQuery(this);var _window=jQuery(window);var windowHeight=_window.height();var panelHeight=element.outerHeight(true);var panelTop=windowHeight-panelHeight;element.css("top",panelTop+"px");});buttonClose.click(function(event){var panels=matchedObject.data("panels")||{};delete panels[name];chatPanel.remove();matchedObject.triggerHandler("delete_chat",[]);event.preventDefault();event.stopPropagation();});buttonMinimize.click(function(event){var minimized=chatPanel.data("minimized");if(minimized){chatPanel.triggerHandler("restore",[]);}else{chatPanel.triggerHandler("minimize",[]);}
event.preventDefault();event.stopPropagation();});header.click(function(){var minimized=chatPanel.data("minimized");if(minimized){chatPanel.triggerHandler("restore",[]);}else{chatPanel.triggerHandler("minimize",[]);}});textArea.keydown(function(event){var keyValue=event.keyCode?event.keyCode:event.charCode?event.charCode:event.which;if(keyValue!=13){return;}
chatPanel.uchatline({name:"me",message:textArea.val()});owner.communication("data",{data:JSON.stringify({type:"chat",receiver:userId,message:textArea.val()})});textArea.val("");event.preventDefault();event.stopPropagation();});setTimeout(function(){textArea.focus();});panels[name]=chatPanel;matchedObject.data("panels",panels)
matchedObject.triggerHandler("new_chat",[]);return chatPanel;};})(jQuery);(function(jQuery){jQuery.fn.uchatline=function(options){var matchedObject=this;var name=options["name"]||matchedObject.data("name");var objectId=options["object_id"]||matchedObject.data("object_id");var message=options["message"];message=message.replace("\n","<br/>");var exp=/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;message=message.replace(exp,"<a href=\"$1\" target=\"_blank\" class=\"link link-blue\">$1</a>");var _body=jQuery("body");var mvcPath=_body.data("mvc_path");objectId=name=="me"?_body.data("object_id"):objectId;var imageUrl=mvcPath+"omni_web_adm/users/"+objectId
+"/image?size=32";var contents=jQuery(".chat-contents",matchedObject);var paragraph=jQuery("> .chat-paragraph:last",contents);var _name=paragraph.data("name");if(name!=_name){var separator=jQuery("<div class=\"chat-separator\"></div>");paragraph.length>0&&contents.append(separator);paragraph=jQuery("<div class=\"chat-paragraph\"></div>");paragraph.css("background-image","url("+imageUrl+")");paragraph.css("background-repeat","no-repeat");paragraph.data("name",name);contents.append(paragraph);}
var prefix=name!=_name?"<strong>"+name+": </strong>":"";paragraph.append("<div class=\"chat-line\">"+prefix+message
+"</div>");var scrollHeight=contents[0].scrollHeight;contents.scrollTop(scrollHeight);};})(jQuery);(function(jQuery){jQuery.fn.ueureka=function(options){var matchedObject=this;var _body=jQuery("body");matchedObject.bind("item",function(event,item){var mvcPath=_body.data("mvc_path");var classIdUrl=_body.data("class_id_url");var objectId=item["object_id"];var cid=item["cid"];var baseUrl=mvcPath+classIdUrl[cid];var link=baseUrl+objectId;item["link"]=link;});};})(jQuery);(function(jQuery){jQuery.fn.utopbar=function(options){var matchedObject=this;var contentBar=jQuery(".content-bar",matchedObject);var contentMargin=jQuery(".content-margin",matchedObject);var handle=jQuery(".top-bar-handle",matchedObject)
handle.click(function(){var element=jQuery(this);var slider=element.parents(".top-bar-slider");var isUp=element.hasClass("up");if(isUp){contentBar.hide();contentBar.css("overflow","hidden");contentMargin.css("height","8px");slider.css("margin-top","0px");element.removeClass("up");}else{contentBar.show();contentBar.css("overflow","visible");contentMargin.css("height","60px");slider.css("margin-top","52px");element.addClass("up");}});return matchedObject;};})(jQuery);(function(jQuery){jQuery.fn.ureport=function(options){var matchedObject=this;var _document=jQuery(document);var location=jQuery(".report-location",matchedObject);var more=jQuery(".report-more",matchedObject);var previous=jQuery(".previous",more);var next=jQuery(".next",more);location.html("-");previous.uxdisable();next.uxdisable();var count=matchedObject.attr("data-rows")||"30";count=parseInt(count);matchedObject.data("count",count);matchedObject.data("page",0);_document.keydown(function(event){var report=matchedObject;var keyValue=event.keyCode?event.keyCode:event.charCode?event.charCode:event.which;switch(keyValue){case 39:case 74:increment(report,options);break;case 37:case 75:decrement(report,options);break;default:break;}});previous.click(function(){var element=jQuery(this);var report=element.parents(".report");decrement(report,options);});next.click(function(){var element=jQuery(this);var report=element.parents(".report");increment(report,options);});var update=function(matchedObject,options){var table=jQuery(".report-table > table",matchedObject);var tableBody=jQuery("tbody",table);var template=jQuery("tr.template",table);var location=jQuery(".report-location",matchedObject);var more=jQuery(".report-more",matchedObject);var previous=jQuery(".previous",more);var next=jQuery(".next",more);var count=matchedObject.data("count");var page=matchedObject.data("page");var limit=matchedObject.data("limit");var items=matchedObject.data("items");var offset=page*count;var end=offset+count;var max=items.length<end?items.length:end;var rows=jQuery("tr:not(.template)",tableBody);rows.remove();var _items=[];for(var index=offset;index<max;index++){var current=items[index];var item=template.uxtemplate(current);_items.push(item[0]);}
tableBody.append(_items);if(page==0){previous.uxdisable();}else{previous.uxenable();}
if(page==limit){next.uxdisable();}else{next.uxenable();}
location.html(String(page+1)+" / "+String(limit+1))};var limits=function(matchedObject,options){var items=matchedObject.data("items");var count=matchedObject.data("count");var limit=items.length/count;limit=parseInt(limit);matchedObject.data("limit",limit);};var decrement=function(matchedObject,options){var page=matchedObject.data("page");if(page==0){return;}
page--;matchedObject.data("page",page);update(matchedObject,options)};var increment=function(matchedObject,options){var page=matchedObject.data("page");var limit=matchedObject.data("limit");if(page==limit){return;}
page++;matchedObject.data("page",page);update(matchedObject,options)};var load=function(matchedObject,options){var dataSource=jQuery(".report-table > .data-source",matchedObject);dataSource.uxdataquery({},function(validItems,moreItems){matchedObject.data("items",validItems);limits(matchedObject,options);update(matchedObject,options);});};load(matchedObject,options);};})(jQuery);jQuery(document).ready(function(){var _body=jQuery("body");_body.uxapply();_body.uapply();});
