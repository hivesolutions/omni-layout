(function(jQuery){jQuery.fn.uapply=function(options){var matchedObject=this;matchedObject.uasync();matchedObject.uconfigurations();matchedObject.utopbar();matchedObject.uscan();var menu=jQuery(".system-menu")
menu.umenu();var chat=jQuery(".chat",matchedObject)
chat.uchat();var eureka=jQuery(".eureka",matchedObject);eureka.ueureka();var report=jQuery(".report",matchedObject);report.ureport();};})(jQuery);(function(jQuery){jQuery.fn.uasync=function(){var SHOW_NOTIFICATION=false;var matchedObject=this;var _validate=function(){var _body=jQuery("body");var async=!_body.hasClass("noajax");return window.FormData?async:false;};var _registerHandlers=function(){var _body=jQuery("body");var links=jQuery("a[href], .link[href]",matchedObject);links.click(function(event){if(event.metaKey||event.ctrlKey){return;}
if(event.which==2||event.which==3){return;}
var element=jQuery(this);var href=element.attr("href");var result=jQuery.uxlinkasync(href,false);result&&event.preventDefault();});var async=_body.data("async")||false;if(async){return;}
_body.bind("data",function(event,data,href,uuid,push,hbase){uuid=uuid||jQuery.uxguid();hbase=hbase||href;var state={uuid:uuid,href:href}
push&&window.history.pushState(state,null,href);try{data=data.replace(/src=/ig,"aux-src=");var base=jQuery(data);var bodyData=data.match(/<body.*>/)[0]
+"</body>";bodyData=bodyData.replace("body","body_");var body=jQuery(bodyData);var _isFull=isFull();var _isSimple=isSimple();var _isBaseFull=isBaseFull(base);var _isBaseSimple=isBaseSimple(base);var isValid=(_isFull||_isSimple)&&(_isBaseFull||_isBaseSimple);if(!isValid){throw"Invalid layout or layout not found";}
updateBase(hbase);var isUpdateFull=_isFull&&_isBaseFull;if(isUpdateFull){updateFull(base,body);}else{updateSimple(base,body);}
updateGuid(uuid);}catch(exception){window.history.back();document.location=href;}});_body.bind("async",function(){var _isFull=isFull();var _isSimple=isSimple();return _isFull||_isSimple;});_body.bind("async_start",function(){if(SHOW_NOTIFICATION){var loading=jQuery.uxlocale("Loading");var container=jQuery(".header-notifications-container");container.empty();var notification=jQuery("<div class=\"header-notification warning\"><strong>"
+loading+"</strong></div>");container.append(notification);}
var topLoader=jQuery(".top-loader");if(topLoader.length==0){var rightPanel=jQuery(".top-bar > .content-wrapper > .right");var topLoader=jQuery("<div class=\"top-loader\">"
+"<div class=\"loader-background\"></div>"
+"</div>");rightPanel.after(topLoader);}
topLoader.width(0);topLoader.show();topLoader.animate({width:60},100);});_body.bind("async_end",function(){if(SHOW_NOTIFICATION){var container=jQuery(".header-notifications-container");var notification=jQuery(".header-notification",container);notification.remove();}
var topLoader=jQuery(".top-loader");topLoader.animate({width:566},150,function(){topLoader.fadeOut(150);});});_body.bind("location",function(event,location){var result=jQuery.uxlinkasync(location,false);return!result;});_body.data("async",true);};var _setPopHandler=function(){if(window.onpopstate!=null){return;}
var initial=null;window.onpopstate=function(event){var isValid=event.state==null||event.state.href==document.URL;var uuid=event.state?event.state.uuid:null;if(event.state!=null||document.location==initial){var href=document.location;isValid&&jQuery.uxlinkasync(href,true,uuid);}
if(initial==null){initial=document.location;}};};var result=_validate();if(!result){var _body=jQuery("body");_body.data("async",false);return;}
_registerHandlers();_setPopHandler();};var isFull=function(){var hasTopBar=jQuery(".top-bar").length>0;if(!hasTopBar){return false;}
var hasSideLeft=jQuery(".sidebar-left").length>0
if(!hasSideLeft){return false;}
return true;};var isSimple=function(){var hasTopBar=jQuery(".top-bar").length>0;if(!hasTopBar){return false;}
var contentWrapper=jQuery("body > .content-wrapper");var childCount=contentWrapper.children().length;if(childCount!=1){return false;}
return true;};var isBaseFull=function(base){var hasTopBar=base.filter(".top-bar");if(!hasTopBar){return false;}
var hasSideLeft=jQuery(".sidebar-left",base).length>0
if(!hasSideLeft){return false;}
return true;};var isBaseSimple=function(base){var contentWrapper=base.filter(".content-wrapper");var childCount=contentWrapper.children().length;if(childCount!=1){return false;}
return true;};var updateBase=function(hbase){var _base=jQuery("head base");if(_base.length==0){var _head=jQuery("head");var _base=jQuery("<base></base>");_head.append(_base);}
_base.attr("href",hbase);};var updateGuid=function(uuid){var _body=jQuery("body");_body.attr("uuid",uuid);};var updateFull=function(base,body){updateBody(body);updateIcon(base);updateResources(base);updateLocale(base);updateWindow(base);updateHeaderImage(base);updateSecondLeft(base);updateMenu(base);updateNotification(base);updateContent(base);updateFooter(base);updateNavigationList(base);updateChat(base);updateSidebarRight(base);updateOverlaySearch(base);updateMeta(base);};var updateSimple=function(base,body){updateBody(body);updateIcon(base);updateResources(base);updateLocale(base);updateWindow(base);updateHeaderImage(base);updateSecondLeft(base);updateMenu(base);updateNotification(base);updateContentFull(base);updateFooter(base);updateOverlaySearch(base);updateMeta(base);};var updateBody=function(body){var _body=jQuery("body");var bodyClass=body.attr("class");_body.attr("class",bodyClass);};var updateIcon=function(base){var icon=base.filter("[rel=\"shortcut icon\"]");var icon_=jQuery("[rel=\"shortcut icon\"]");icon_.replaceWith(icon);};var updateResources=function(base){var _head=jQuery("head");var _body=jQuery("body");var section=jQuery("#section",base);var basePath=jQuery("#base-path",base);var section_=jQuery(".meta > #section");var sectionValue=section.html();var sectionValue_=section_.html();var basePathValue=basePath.html();var isDifferent=sectionValue!=sectionValue_;if(!isDifferent){return;}
var sectionsL=_body.data("sections_l")||{};_body.data("sections_l",sectionsL);sectionsL[sectionValue_]=true;var exists=sectionsL[sectionValue]||false;if(exists){return;}
_head.append("<link rel=\"stylesheet\" href=\""+basePathValue
+"resources/css/layout.css\" type=\"text/css\" />");_head.append("<script type=\"text/javascript\" src=\""+basePathValue
+"resources/js/main.js\"></script>");};var updateLocale=function(base){var locale=jQuery("#locale",base);var locale_=jQuery("[data-locale]");var language=locale.html().replace("_","-");locale_.attr("data-locale",language);};var updateHeaderImage=function(base){var topBar=base.filter(".top-bar");var headerImage=jQuery(".header-logo-area",topBar);var headerImage_=jQuery(".top-bar .header-logo-area");var headerImageLink=headerImage.attr("href");headerImage_.attr("href",headerImageLink);};var updateSecondLeft=function(base){var topBar=base.filter(".top-bar");var secondLeft=jQuery(".left:nth-child(2)",topBar);var secondLeft_=jQuery(".top-bar .left:nth-child(2)");var secondLeftHtml=secondLeft.html();secondLeftHtml=secondLeftHtml.replace(/aux-src=/ig,"src=");secondLeft_.html(secondLeftHtml);secondLeft_.uxapply();};var updateMenu=function(base){var topBar=base.filter(".top-bar");var menu=jQuery(".system-menu",topBar);var menu_=jQuery(".top-bar .system-menu");var menuHtml=menu.html();menuHtml=menuHtml.replace(/aux-src=/ig,"src=");menu_.replaceWith("<div class=\"menu system-menu\">"+menuHtml
+"</div>");menu_=jQuery(".top-bar .system-menu");menu_.uxapply();};var updateNotification=function(base){var container=jQuery(".header-notifications-container");var notifications=jQuery(".header-notification",base);container.append(notifications);container.uxapply();};var updateContent=function(base){var content=jQuery(".content",base);var content_=jQuery(".content");var contentClass=content.attr("class")
var contentHtml=content.html();contentHtml=contentHtml.replace(/aux-src=/ig,"src=");content_.html(contentHtml);content_.attr("class",contentClass);content_.uxapply();content_.uxshortcuts();};var updateContentFull=function(base){var content=base.filter(".content-wrapper");var content_=jQuery("body > .content-wrapper");var contentClass=content.attr("class")
var contentHtml=content.html();contentHtml=contentHtml.replace(/aux-src=/ig,"src=");content_.html(contentHtml);content_.attr("class",contentClass);content_.uxapply();};var updateFooter=function(base){var footer=base.filter(".footer");var footer_=jQuery(".footer");var footerHtml=footer.html();footerHtml=footerHtml.replace(/aux-src=/ig,"src=");footer_.html(footerHtml);footer_.uxapply();};var updateWindow=function(base){var windowOuter=base.filter(".window")
var windowInner=jQuery(".window",base);var window=windowOuter.add(windowInner);var window_=jQuery(".window");var placeholder=jQuery(".window-placeholder");if(placeholder.length==0){var _body=jQuery("body");placeholder=jQuery("<div class=\"window-placeholder\"></div>");_body.append(placeholder);}
window_.remove();placeholder.empty();placeholder.append(window);placeholder.uxapply();};var updateNavigationList=function(base){var navigationList=jQuery(".sidebar-left > .navigation-list",base);var navigationList_=jQuery(".sidebar-left > .navigation-list");var navigationListHtml=navigationList.html();navigationListHtml=navigationListHtml.replace(/aux-src=/ig,"src=");navigationList_.html(navigationListHtml);navigationList_.uxapply();navigationList_.uxlist();};var updateChat=function(base){var chat=jQuery(".sidebar-left > .chat",base);var chat_=jQuery(".sidebar-left > .chat");var exists=chat_.length>0;if(exists){var url=chat.attr("data-url");chat_.attr("data-url",url);}else{var sideLeft=jQuery(".sidebar-left");sideLeft.append(chat);chat.uchat();}};var updateSidebarRight=function(base){var sidebarRight=jQuery(".sidebar-right",base);var sidebarRight_=jQuery(".sidebar-right");if(sidebarRight_.length==0){var content_=jQuery(".content");content_.after(sidebarRight);}
var sidebarRightHtml=sidebarRight.html()||"";sidebarRightHtml=sidebarRightHtml.replace(/aux-src=/ig,"src=");sidebarRight_.html(sidebarRightHtml);sidebarRight_.uxapply();};var updateOverlaySearch=function(base){var overlaySearch=base.filter(".overlay-search");var overlaySearch_=jQuery(".overlay-search");var overlaySearchHtml=overlaySearch.html();overlaySearchHtml=overlaySearchHtml.replace(/aux-src=/ig,"src=");overlaySearch_.html(overlaySearchHtml);overlaySearch_.uxapply();overlaySearch_.uxoverlaysearch();};var updateMeta=function(base){var _body=jQuery("body");var meta=base.filter(".meta")
var meta_=jQuery(".meta");var metaHtml=meta.html();metaHtml=metaHtml.replace(/aux-src=/ig,"src=");meta_.html(metaHtml);meta_.uxapply();_body.uconfigurations();};})(jQuery);(function(jQuery){jQuery.fn.uconfigurations=function(options){var matchedObject=this;var isBody=matchedObject.is("body");if(!isBody){return;}
var basePath=jQuery("#base-path",matchedObject).html();var mvcPath=jQuery("#mvc-path",matchedObject).html();var locale=jQuery("#locale",matchedObject).html();var objectId=jQuery("#object-id",matchedObject).html();var username=jQuery("#username",matchedObject).html();var representation=jQuery("#representation",matchedObject).html();var definitions_s=jQuery("#definitions",matchedObject).html();var alias_s=jQuery("#alias",matchedObject).html();var definitions=jQuery.parseJSON(definitions_s)||{};var alias=jQuery.parseJSON(alias_s)||{};var sections=definitions["sections"]||{};var classIdUrl=definitions["class_id_url"]||{};var paths={};for(name in sections){var section=sections[name];var path=alias[section]||section;paths[name]=path;}
var tagRegex=new RegExp("\%\[[a-z]+\]","g");for(classId in classIdUrl){var url=classIdUrl[classId];while(true){var result=tagRegex.exec(url);if(result==null){break;}
result=result[0];var name=result.slice(2,result.length-1)
var path=paths[name]
url=url.replace(result,path);}
classIdUrl[classId]=url;}
matchedObject.data("base_path",basePath);matchedObject.data("mvc_path",mvcPath);matchedObject.data("locale",locale);matchedObject.data("object_id",objectId);matchedObject.data("username",username);matchedObject.data("representation",representation);matchedObject.data("definitions",definitions);matchedObject.data("alias",alias);matchedObject.data("sections",sections);matchedObject.data("class_id_url",classIdUrl);};})(jQuery);(function(jQuery){jQuery.uquery=function(param){var _body=jQuery("body");var mvcPath=_body.data("mvc_path");if(!mvcPath){throw jQuery.uxexception("No mvc path variable defined");}
var alias=_body.data("alias")||{};var type=param["type"]||"get";var url=param["url"];var data=param["data"];var complete=param["complete"];var success=param["success"];var error=param["error"];var urlSplit=url.split("/");var section=urlSplit[0];var remainder=urlSplit.slice(1);var sectionUrl=alias[section]||section;url=sectionUrl+"/"+remainder.join("/")
url=mvcPath+url;var filters=data["filters"]||[];var _filters=[];for(var index=0;index<filters.length;index++){var filter=filters[index];var name=filter[0];var value=filter.length==3?String(filter[2]):String(filter[1]);var operation=filter.length==3?filter[1]:"equals";var _filter=name+":"+operation+":"+value;_filters.push(_filter);}
data["filters[]"]=_filters;delete data["filters"];jQuery.ajax({type:type,url:url,data:data,complete:complete,success:success,error:error});};})(jQuery);(function(jQuery){jQuery.fn.umenu=function(options){var matchedObject=this;matchedObject.each(function(index,element){var _element=jQuery(this);var _switch=jQuery(".switch",_element);var back=jQuery(".back",_element);_element.bind("show",function(){var element=jQuery(this);var menu=_element;var accountPanel=jQuery(".account-panel",menu);var switchPanel=jQuery(".switch-panel",menu);switchPanel.hide();accountPanel.show();element.uxmenulink("reposition");});_switch.click(function(){var element=jQuery(this);var menu=element.parents(".menu");var accountPanel=jQuery(".account-panel",menu);var switchPanel=jQuery(".switch-panel",menu);accountPanel.hide();switchPanel.show();menu.uxmenulink("reposition");});back.click(function(){var element=jQuery(this);var menu=element.parents(".menu");var accountPanel=jQuery(".account-panel",menu);var switchPanel=jQuery(".switch-panel",menu);accountPanel.show();switchPanel.hide();menu.uxmenulink("reposition");});});return matchedObject;};})(jQuery);(function(jQuery){jQuery.fn.uscan=function(options){var SCAN_CODE_LENGTH=22;var COMPATIBLE_VERSIONS=[1];var matchedObject=this;var isBody=matchedObject.is("body");if(!isBody){return;}
var _document=jQuery(document);var _body=jQuery("body");_document.bind("scan",function(event,value){var element=jQuery(this);var mvcPath=_body.data("mvc_path");var classIdUrl=_body.data("class_id_url");if(value.length!=SCAN_CODE_LENGTH){return;}
var checksumS=value.slice(0,4);checksumS=parseInt(checksumS);checksumS=String(checksumS);var buffer=value.slice(4);var _checksumS=checksum(buffer);if(_checksumS!=checksumS){return;}
var version=value.slice(4,6);var classId=value.slice(6,10);var objectId=value.slice(10);var versionInt=parseInt(version);if(isNaN(versionInt)){return;}
var classIdInt=parseInt(classId);if(isNaN(classIdInt)){return;}
var objectIdInt=parseInt(objectId);if(isNaN(objectId)){return;}
var isCompatible=COMPATIBLE_VERSIONS.indexOf(versionInt)!=-1;if(!isCompatible){return;}
var classUrl=classIdUrl[classIdInt];if(!classUrl){return;}
event.uscan=true;try{element.triggerHandler("uscan",[versionInt,classIdInt,objectIdInt]);}catch(exception){return;}
var baseUrl=mvcPath+classUrl;objectId=objectId.replace(/^0+|\s+$/g,"");jQuery.uxlocation(baseUrl+objectId);});_document.bind("scan_error",function(event,value){});var checksum=function(buffer,modulus,salt){modulus=modulus||10000;salt=salt||"omni";var _buffer=buffer+salt;var counter=0;for(var index=0;index<_buffer.length;index++){var _byte=_buffer[index];var byteI=_byte.charCodeAt(0);counter+=byteI<<index;}
var checksum=counter%modulus;var checksumS=String(checksum);return checksumS;};};})(jQuery);(function(jQuery){jQuery.fn.uchat=function(options){var matchedObject=this;var _window=jQuery(window);var placePanels=function(panels){var windowHeight=_window.height();var windowWidth=_window.width();var extraMargin=14;for(var key in panels){var panel=panels[key];var panelHeight=panel.outerHeight(true);var panelWidth=panel.outerWidth(true);var chatTop=windowHeight-panelHeight;var chatLeft=windowWidth-panelWidth-extraMargin;panel.css("top",chatTop+"px");panel.css("left",chatLeft+"px");extraMargin+=panelWidth+8;}};var createItem=function(matchedObject,data){var budyList=jQuery(".buddy-list",matchedObject);var status=data["status"];var objectId=data["object_id"];var username=data["username"];var representation=data["representation"];var item=jQuery("<li class=\"budy-"+status
+"\" data-user_id=\""+username+"\" data-object_id=\""
+objectId+"\">"+representation+"</li>")
budyList.append(item);item.click(function(){var element=jQuery(this);var name=element.html();var userId=element.attr("data-user_id");var objectId=element.attr("data-object_id");matchedObject.uchatpanel({owner:matchedObject,name:name,user_id:userId,object_id:objectId});});};var dataProcessor=function(data){var isString=typeof data=="string";var jsonData=isString?jQuery.parseJSON(data):data;var type=jsonData["type"];switch(type){case"message":messageProcessor(jsonData);break;case"status":statusProcessor(jsonData);break;default:break;}};var messageProcessor=function(envelope){var message=envelope["message"];var sender=envelope["sender"];var panel=jQuery(".chat-panel[data-user_id="+sender+"]",matchedObject);if(panel.length==0){var userStatus=matchedObject.data("user_status");var userS=userStatus[sender];var objectId=userS["object_id"];var representation=userS["representation"];panel=matchedObject.uchatpanel({owner:matchedObject,name:representation,user_id:sender,object_id:objectId});}
panel.trigger("restore");panel.uchatline({message:message});var audio=jQuery("> audio",matchedObject);audio[0].play();};var statusProcessor=function(envelope){var _body=jQuery("body");var username=_body.data("username");var status=envelope["status"];var objectId=envelope["object_id"];var _username=envelope["username"];var representation=envelope["representation"];if(username==_username){return;}
var userStatus=matchedObject.data("user_status")||{};var userS=userStatus[_username]||{};userS["status"]=status;userS["object_id"]=objectId;userS["username"]=_username;userS["representation"]=representation;userStatus[_username]=userS;matchedObject.data("user_status",userStatus);switch(status){case"offline":var item=jQuery(".buddy-list > li[data-user_id="
+_username+"]",matchedObject)
item.remove();break;default:var item=jQuery(".buddy-list > li[data-user_id="
+_username+"]",matchedObject)
if(item.length==0){createItem(matchedObject,envelope);}
item.removeClass("budy-online");item.removeClass("budy-busy");item.removeClass("budy-unavailable");item.addClass("budy-"+status);break;}};matchedObject.each(function(index,element){var _element=jQuery(this);var isRegistered=_element.data("registered")||false;if(isRegistered){return;}
_element.data("registered",true);var _body=jQuery("body");var username=_body.data("username");var url=_element.attr("data-url");var absolueUrl=jQuery.uxresolve(url+"/pushi");var key=_element.attr("data-key");var pushi=new Pushi(key,{authEndpoint:absolueUrl});pushi.bind("connect",function(event){this.subscribe("global");this.subscribe("presence-status");});pushi.bind("subscribe",function(event,channel,data){if(channel!="presence-status"){return;}
var members=data.members||{};for(var key in members){var member=members[key];var envelope={type:"status",status:"online",object_id:member.object_id,username:member.username,representation:member.representation};dataProcessor(envelope);}});pushi.bind("message",function(event,data,channel){dataProcessor(data);});pushi.bind("member_added",function(event,channel,member){var envelope={type:"status",status:"online",object_id:member.object_id,username:member.username,representation:member.representation};dataProcessor(envelope);});pushi.bind("member_removed",function(event,channel,member){var envelope={type:"status",status:"offline",object_id:member.object_id,username:member.username,representation:member.representation};dataProcessor(envelope);});_element.data("pushi",pushi);var sound=_element.attr("data-sound");var audio=jQuery("<audio src=\""+sound
+"\" preload=\"none\"></audio>");matchedObject.append(audio);});matchedObject.bind("new_chat",function(){var panels=matchedObject.data("panels")||{};placePanels(panels);});matchedObject.bind("delete_chat",function(){var panels=matchedObject.data("panels")||{};placePanels(panels);});_window.resize(function(){var panels=matchedObject.data("panels")||{};placePanels(panels);});};})(jQuery);(function(jQuery){jQuery.fn.uchatpanel=function(options){var matchedObject=this;var _body=jQuery("body");var owner=options["owner"];var name=options["name"];var userId=options["user_id"];var objectId=options["object_id"];var ownerId=options["owner_id"];var panels=matchedObject.data("panels")||{};var chatPanel=panels[name];if(chatPanel){return;}
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
var username=_body.data("username");var channelNames=[username,userId];channelNames.sort();var channel=channelNames.join("_");chatPanel.uchatline({name:"me",message:textArea.val()});var data=JSON.stringify({type:"message",sender:username,receiver:userId,message:textArea.val()});var pushi=owner.data("pushi");pushi.sendChannel("message",data,"peer-status:"+channel);textArea.val("");event.preventDefault();event.stopPropagation();});setTimeout(function(){textArea.focus();});panels[name]=chatPanel;matchedObject.data("panels",panels)
matchedObject.triggerHandler("new_chat",[]);return chatPanel;};})(jQuery);(function(jQuery){var URL_REGEX=new RegExp(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig);jQuery.fn.uchatline=function(options){var matchedObject=this;var _body=jQuery("body");var mvcPath=_body.data("mvc_path");var name=options["name"]||matchedObject.data("name");var objectId=options["object_id"]||matchedObject.data("object_id");var message=options["message"];message=message.replace("\n","<br/>");message=message.replace(URL_REGEX,"<a href=\"$1\" target=\"_blank\" class=\"link link-blue\">$1</a>");objectId=name=="me"?_body.data("object_id"):objectId;var imageUrl=mvcPath+"omni_web_adm/users/"+objectId
+"/image?size=32";var contents=jQuery(".chat-contents",matchedObject);var paragraph=jQuery("> .chat-paragraph:last",contents);var _name=paragraph.data("name");if(name!=_name){var separator=jQuery("<div class=\"chat-separator\"></div>");paragraph.length>0&&contents.append(separator);paragraph=jQuery("<div class=\"chat-paragraph\"></div>");paragraph.css("background-image","url("+imageUrl+")");paragraph.css("background-repeat","no-repeat");paragraph.data("name",name);contents.append(paragraph);}
var prefix=name!=_name?"<strong>"+name+": </strong>":"";var chatLine=jQuery("<div class=\"chat-line\">"+prefix+message
+"</div>");paragraph.append(chatLine);chatLine.uxapply();var scrollHeight=contents[0].scrollHeight;contents.scrollTop(scrollHeight);};})(jQuery);(function(jQuery){jQuery.fn.ueureka=function(options){var matchedObject=this;if(!matchedObject||matchedObject.length==0){return;}
var _body=jQuery("body");var textField=jQuery(".text-field",matchedObject);textField.keydown(function(event){var element=jQuery(this);var overlayPanel=element.parents(".overlay-panel");var key=overlayPanel.attr("data-key");key=key?parseInt(key):key;var eventKeyCode=event.keyCode?event.keyCode:event.which;if(eventKeyCode==27||eventKeyCode==key){return;}
event.stopPropagation();event.stopImmediatePropagation();});matchedObject.bind("item",function(event,item){var mvcPath=_body.data("mvc_path");var classIdUrl=_body.data("class_id_url");var objectId=item["object_id"];var cid=item["cid"];var baseUrl=mvcPath+classIdUrl[cid];var link=baseUrl+objectId;item["link"]=link;});matchedObject.bind("value_select",function(event,value,valueLogic,item){var element=jQuery(this);var overlayPanel=element.parents(".overlay-panel");overlayPanel.triggerHandler("hide");});};})(jQuery);(function(jQuery){jQuery.fn.utopbar=function(options){var matchedObject=this;var contentBar=jQuery(".content-bar",matchedObject);var contentMargin=jQuery(".content-margin",matchedObject);var handle=jQuery(".top-bar-handle",matchedObject)
handle.click(function(){var element=jQuery(this);var slider=element.parents(".top-bar-slider");var isUp=element.hasClass("up");if(isUp){contentBar.hide();contentBar.css("overflow","hidden");contentMargin.css("height","8px");slider.css("margin-top","0px");element.removeClass("up");}else{contentBar.show();contentBar.css("overflow","visible");contentMargin.css("height","60px");slider.css("margin-top","52px");element.addClass("up");}});return matchedObject;};})(jQuery);(function(jQuery){jQuery.fn.ureport=function(options){var MAX_RECORDS=100000000;var matchedObject=this;var _document=jQuery(document);if(matchedObject.length==0){return}
var search=window.location.search;var pathname=window.location.pathname;var pathname_l=pathname.length;var extension=pathname.slice(pathname_l-4,pathname_l);if(extension==".prt"){matchedObject.attr("data-print",1);}
var buttons=jQuery(".report-header > .buttons",matchedObject);var links=jQuery("> a",buttons);var location=jQuery(".report-location",matchedObject);var more=jQuery(".report-more",matchedObject);var previous=jQuery(".previous",more);var next=jQuery(".next",more);location.html("-");previous.uxdisable();next.uxdisable();links.each(function(index,element){var _element=jQuery(this);var href=_element.attr("href");_element.attr("href",href+search);});var print=matchedObject.attr("data-print");var count=matchedObject.attr("data-rows")||"30";count=print?MAX_RECORDS:parseInt(count);matchedObject.data("count",count);matchedObject.data("page",0);if(print){var header=jQuery(".header");var footer=jQuery(".footer");var topBar=jQuery(".top-bar");matchedObject.addClass("print");header.remove();footer.remove();topBar.remove();window.print();}
_document.keydown(function(event){var report=matchedObject;var keyValue=event.keyCode?event.keyCode:event.charCode?event.charCode:event.which;switch(keyValue){case 39:case 74:increment(report,options);break;case 37:case 75:decrement(report,options);break;default:break;}});previous.click(function(){var element=jQuery(this);var report=element.parents(".report");decrement(report,options);});next.click(function(){var element=jQuery(this);var report=element.parents(".report");increment(report,options);});var update=function(matchedObject,options){var table=jQuery(".report-table > table",matchedObject);var tableBody=jQuery("tbody",table);var template=jQuery("tr.template",table);var location=jQuery(".report-location",matchedObject);var more=jQuery(".report-more",matchedObject);var previous=jQuery(".previous",more);var next=jQuery(".next",more);var count=matchedObject.data("count");var page=matchedObject.data("page");var limit=matchedObject.data("limit");var items=matchedObject.data("items");var offset=page*count;var end=offset+count;var max=items.length<end?items.length:end;var rows=jQuery("tr:not(.template)",tableBody);rows.remove();var _items=[];for(var index=offset;index<max;index++){var current=items[index];var item=template.uxtemplate(current);_items.push(item[0]);}
tableBody.append(_items);if(page==0){previous.uxdisable();}else{previous.uxenable();}
if(page==limit){next.uxdisable();}else{next.uxenable();}
location.html(String(page+1)+" / "+String(limit+1))};var limits=function(matchedObject,options){var items=matchedObject.data("items");var count=matchedObject.data("count");var limit=items.length/count;limit=parseInt(limit);matchedObject.data("limit",limit);};var decrement=function(matchedObject,options){var page=matchedObject.data("page");if(page==0){return;}
page--;matchedObject.data("page",page);update(matchedObject,options)};var increment=function(matchedObject,options){var page=matchedObject.data("page");var limit=matchedObject.data("limit");if(page==limit){return;}
page++;matchedObject.data("page",page);update(matchedObject,options)};var load=function(matchedObject,options){var dataSource=jQuery(".report-table > .data-source",matchedObject);dataSource.uxdataquery({},function(validItems,moreItems){matchedObject.data("items",validItems);limits(matchedObject,options);update(matchedObject,options);});};load(matchedObject,options);};})(jQuery);jQuery(document).ready(function(){var _body=jQuery("body");_body.uxapply();_body.uapply();_body.bind("applied",function(event,base){base.uapply();});});
