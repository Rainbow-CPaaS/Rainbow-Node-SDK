"use strict";

import {XMPPService} from "../XMPPService";
import {getJsonFromXML, logEntryExit} from "../../common/Utils";
import {GenericHandler} from "./GenericHandler";
import {RESTService} from "../RESTService";
import {RPCoverXMPPService} from "../../services/RPCoverXMPPService.js";
import {RPCManager} from "../../common/RPCManager.js";


const xml = require("@xmpp/xml");
const packageVersion = require("../../../package");

const prettydata = require("../pretty-data").pd;

const LOG_ID = "XMPP/HNDL/IQ/RPCoverXMPP - ";

@logEntryExit(LOG_ID)
class RpcoverxmppEventHandler extends GenericHandler {
    public IQ_GET: any;
    public IQ_SET: any;
    public IQ_RESULT: any;
    public IQ_ERROR: any;
    private _rest: RESTService;
    private _rpcoverxmpp: RPCoverXMPPService;
    private _rpcManager: RPCManager;
    options: any;
    /*public onIqGetReceived: any;
    public onIqResultReceived: any;
    public _onIqGetPingReceived: any;
    public _onIqGetQueryReceived: any;
    public _onIqGetPbxAgentStatusReceived: any;

     */

    static getClassName(){ return 'RpcoverxmppEventHandler'; }
    getClassName(){ return RpcoverxmppEventHandler.getClassName(); }

    static getAccessorName(){ return 'rpcoverxmppevent'; }
    getAccessorName(){ return RpcoverxmppEventHandler.getAccessorName(); }

    constructor(xmppService: XMPPService, restService: RESTService, options: any, rpcoverxmpp : RPCoverXMPPService) {
        super( xmppService);
        let that = this;

        that._rest = restService;
        this.IQ_GET = "jabber:client.iq.get";
        this.IQ_SET = "jabber:client.iq.set";
        this.IQ_RESULT = "jabber:client.iq.result";
        this.IQ_ERROR = "jabber:client.iq.error";
        
        that.options = options;
        
        that._rpcoverxmpp = rpcoverxmpp;
        that._rpcManager = rpcoverxmpp.rpcManager;
    }


    onIqGetSetReceived (msg, stanzaTab) {
        let that = this;
        let stanza = stanzaTab[0];
        let prettyStanza = stanzaTab[1];
        let jsonStanza = stanzaTab[2];

        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(onIqGetSetReceived) _entering_ : ", msg, prettyStanza);
            let children = stanza.children;
            children.forEach((node) => {
                switch (node.getName()) {
                    case "req":
                        // treatement in iqEventHandler
                        /*that._logger.log(that.INTERNAL, LOG_ID + "(onIqGetSetReceived) query : ", msg, stanza);
                        that._onIqGetSetReqReceived(stanza, node);
                        // */
                        break;
                    case "query":
                        that._logger.log(that.INTERNAL, LOG_ID + "(onIqGetSetReceived) query : ", msg, stanza);
                        if (node.attrs.xmlns === "jabber:iq:rpc") {
                            that._onIqGetSetQueryReceived(stanza, node);
                        }
                        break;
                    case "ping":
                        // treatement in iqEventHandler
                        break;
                    case "events":
                        // treatement in presenceEventHandler
                        break;
                    case "autoreply":
                        // treatement in presenceEventHandler
                        break;
                    /*case "default":
                                     that._logger.log(that.INTERNAL, LOG_ID + "(onIqGetSetReceived) default : ", msg, stanza.root ? prettydata.xml(stanza.root().toString()) : stanza);
                                     that._logger.log(that.WARN, LOG_ID + "(onIqGetSetReceived) not managed - 'stanza'", node.getName());
                                     break; // */
                    default:
                        that._logger.log(that.INTERNAL, LOG_ID + "(onIqGetSetReceived) _entering_ : ", msg, stanza.root ? prettydata.xml(stanza.root().toString()) : stanza);
                        that._logger.log(that.WARN, LOG_ID + "(onIqGetSetReceived) child not managed for iq - 'stanza' name : ", node.getName());
                        that._logger.log(that.INTERNAL, LOG_ID + "(onIqGetSetReceived) child not managed for iq - 'stanza' name : ", node.getName(), ",stanza : ",  "\n", stanza.root ? prettydata.xml(stanza.root().toString()) : stanza, " node : ", node);

                }
            });
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onIqGetSetReceived) CATCH ErrorManager !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onIqGetSetReceived) CATCH ErrorManager !!! : ", err);
        }
    };

    onIqResultReceived (msg, stanzaTab) {
        let that = this;
        let stanza = stanzaTab[0];
        let prettyStanza = stanzaTab[1];
        let jsonStanza = stanzaTab[2];

        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(onIqResultReceived) _entering_", msg, "\n", prettyStanza);
            let children = stanza.children;
            children.forEach((node) => {
                switch (node.getName()) {
                    case "query":
                        // The treatment is in iqEventHandler
                        break;
                    case "resp":
                        that._logger.log(that.DEBUG, LOG_ID + "(onIqResultReceived) - 'stanza'", node.getName());
                        that._onIqRespResultReceived(stanza, node);
                        break;
                    case "bind":
                        // The treatment is in iqEventHandler
                        //that._logger.log(that.INFO, LOG_ID + "(onIqResultReceived) - 'stanza'", node.getName());
                        break;
                    case "pbxagentstatus":
                        // The treatment is in telephonyEventHandler
                        //that._onIqGetPbxAgentStatusReceived(stanza, node);
                        break;
                    case "deleted":
                        // One treatment is in calllogEventHandler
                        break;
                    case "fin":
                        // The treatment is in ConversationHistoryHandler
                        break;
                    /*case "default":
                        that._logger.log(that.WARN, LOG_ID + "(onIqResultReceived) - not managed - 'stanza'", node.getName());
                        break; //*/
                    default:
                        that._logger.log(that.WARN, LOG_ID + "(onIqResultReceived) - child not managed for iq - 'stanza'", node.getName());
                        that._logger.log(that.INTERNAL, LOG_ID + "(onIqResultReceived) - child not managed for iq - 'stanza' name : ", node.getName(), ", stanza : ",  "\n", prettyStanza, " node : ", node);
                }
            });
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onIqResultReceived) CATCH ErrorManager !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onIqResultReceived) CATCH ErrorManager !!! : ", err);
        }
    };
    
    async _onIqGetSetQueryReceived (stanza, node) {
        let that = this;
        // treatment of the XEP 0332.
        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(_onIqGetSetQueryReceived) _entering_ : ", "\n", stanza.root ? prettydata.xml(stanza.root().toString()):stanza, "\n", node.root ? prettydata.xml(node.root().toString()):node);
            let xmlNodeStr = node ? node.toString():"<xml></xml>";
            let reqObj = await getJsonFromXML(xmlNodeStr);
            that._logger.log(that.DEBUG, LOG_ID + "(_onIqGetSetQueryReceived) reqObj : ", reqObj);
            
            if (reqObj.query && reqObj.query.methodCall) {
                let methodName = reqObj.query.methodCall.methodName;
                let methodParams = [];

                let params = reqObj.query.methodCall.params;

                that._logger.log(that.DEBUG, LOG_ID + "(_onIqGetSetQueryReceived) methodName : ", methodName);
                that._logger.log(that.DEBUG, LOG_ID + "(_onIqGetSetQueryReceived) params : ", params);

                if (params) {
                    if (params.param && Array.isArray(params.param)) {
                        for (const param of params.param) {
                            let paramDecoded = that.xmppService.decodeRPCParam(param);
                            that._logger.log(that.DEBUG, LOG_ID + "(_onIqGetSetQueryReceived) paramDecoded : ", paramDecoded);
                            methodParams.push(paramDecoded);
                        }
                    } else {
                        let paramDecoded = that.xmppService.decodeRPCParam(params.param);
                        that._logger.log(that.DEBUG, LOG_ID + "(_onIqGetSetQueryReceived) paramDecoded : ", paramDecoded);
                        methodParams.push(paramDecoded);
                    }
                }
                that._logger.log(that.DEBUG, LOG_ID + "(_onIqGetSetQueryReceived) methodParams : ", methodParams);
                //console.log(LOG_ID + "(_onIqGetSetQueryReceived) methodParams : ", methodParams);

                /*
                <iq type='result'
        from='responder@company-a.com/jrpc-server'
        to='requester@company-b.com/jrpc-client'
        id='rpc1'>
      <query xmlns='jabber:iq:rpc'>
        <methodResponse>
          <params>
            <param>
              <value><string>Colorado</string></value>
            </param>
          </params>
        </methodResponse>
      </query>
    </iq>
    // */

                let resulRPCMethod = that._rpcManager.treatRPCMethod(methodName, methodParams);
                that._logger.log(that.DEBUG, LOG_ID + "(_onIqGetSetQueryReceived) (handleXMPPConnection) treatRPCMethod result  : ", resulRPCMethod);

                let stanzaResp = xml("query", {
                    "xmlns": "jabber:iq:rpc",
                })

                let stanzaMethodResponse = xml("methodResponse", {});

                //let encodedData = encodeURIComponent(resultOfHttp);
                /*let stanzaParams = xml("params", {});
                let stanzaParam = xml("param", {});
                let stanzaValue = xml("value", {});
                let stanzaString = xml("string", {}, "result OK");
                // */
                let stanzaParams = xml("params", {}); 
                
                //stanzaMethodCall.append(stanzaParams, undefined);

                that.xmppService.paramToStanza([resulRPCMethod], stanzaParams);
                // stanzaValue.append(stanzaString, undefined);
                // stanzaParam.append(stanzaValue, undefined);
                // stanzaParams.append(stanzaParam, undefined);
                stanzaMethodResponse.append(stanzaParams, undefined);
                stanzaResp.append(stanzaMethodResponse, undefined);


                that._logger.log(that.DEBUG, LOG_ID + "(_onIqGetSetQueryReceived) (handleXMPPConnection) send req result - 'stanza' : ", stanzaResp);

                await that.xmppClient.resolvPendingRequest(stanza.attrs.id, stanzaResp);
            }
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(_onIqGetSetQueryReceived) (handleXMPPConnection) CATCH ErrorManager !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(_onIqGetSetQueryReceived) (handleXMPPConnection) CATCH ErrorManager !!! : ", err);
        }
    }
    
    async _onIqGetSetReqReceived(stanza, node) {
        let that = this;
        // treatment of the XEP 0332.
        try {
            if ( !that.options._httpoverxmppserver) {
                that._logger.log(that.INTERNAL, LOG_ID + "(_onIqGetSetReqReceived) httpoverxmppserver is desactivated, so send empty response to request : ", "\n", stanza.root ? prettydata.xml(stanza.root().toString()):stanza, "\n", node.root ? prettydata.xml(node.root().toString()):node);
                await that.xmppClient.resolvPendingRequest(stanza.attrs.id, {});
                return (0);
            }

            that._logger.log(that.INTERNAL, LOG_ID + "(_onIqGetSetReqReceived) _entering_ : ", "\n", stanza.root ? prettydata.xml(stanza.root().toString()):stanza, "\n", node.root ? prettydata.xml(node.root().toString()):node);
            let xmlNodeStr = node ? node.toString():"<xml></xml>";
            let reqObj = await getJsonFromXML(xmlNodeStr);
            that._logger.log(that.DEBUG, LOG_ID + "(_onIqGetSetReqReceived) reqObj : ", reqObj);
            
            let host = "";
            let resourceUrl = "";
            let method = "";
            let headers = {};

            if (reqObj && reqObj.req ) {
                if (reqObj.req.headers && reqObj.req.headers.header) {
                    if (reqObj.req.headers.header.length===undefined) {
                        if (reqObj.req.headers.header && reqObj.req.headers.header.$attrs.name==="Host") {
                            host = reqObj.req.headers.header._;
                        }
                    } else {
                        for (let i = 0; i < reqObj.req.headers.header.length; i++) {
                            // Add headers from comming event to Http Headers. Not sure it is necessary for http GET method.
                            if (reqObj.req.headers.header[i] && reqObj.req.headers.header[i].$attrs.name==="Host") {
                                host = reqObj.req.headers.header[i]._;
                            } else {
                                headers[reqObj.req.headers.header[i].$attrs.name] = reqObj.req.headers.header[i]._;
                            }
                        }
                    }
                }
                if (reqObj.req.$attrs) {
                    resourceUrl = reqObj.req.$attrs.resource;
                    method = reqObj.req.$attrs.method;
                }
                let urlBuilt = host + resourceUrl;

                let resultOfHttp = undefined;
                let statusCodeHttp = -1;
                let statusMessageHttp = "";
                let headersHttp;
                switch (method) {
                    case "GET": {

                        let response = await that._rest.http.getUrlRaw(urlBuilt, headers, undefined);
                        that._logger.log(that.DEBUG, LOG_ID + "(_onIqGetSetReqReceived) get url successfull");
                        //that._logger.log(that.INTERNAL, LOG_ID + "(_onIqGetSetReqReceived) get url HTTP result : ", response);
                        if (response) {
                            if (response.statusCode) {
                                statusCodeHttp = response.statusCode;
                                statusMessageHttp = response.statusMessage;
                                headersHttp = response.headers;
                                that._logger.log(that.DEBUG, LOG_ID + "(_onIqGetSetReqReceived) get HTTP statusCode defined, statusCodeHttp: ", statusCodeHttp, ", statusMessageHttp : ", statusMessageHttp);
                                resultOfHttp = response.body;
                            } else {
                                statusCodeHttp = -1;
                            }
                        } else {
                        }
                    }
                    break;
                    case "TRACE": {

                        that._logger.log(that.DEBUG, LOG_ID + "(_onIqGetSetReqReceived) trace successfull");
                        //that._logger.log(that.INTERNAL, LOG_ID + "(_onIqGetSetReqReceived) get url HTTP result : ", response);
                        statusCodeHttp = 200;
                        statusMessageHttp = "OK";
                        headersHttp = {
                            'Date': new Date().toLocaleDateString(),
                            'Server': "rainbowNodeSDK_" + packageVersion.version,
                            'Content-Type': "message/http",
                            'Content-Length': 100
                        }
                        that._logger.log(that.DEBUG, LOG_ID + "(_onIqGetSetReqReceived) trace HTTP statusCode defined, statusCodeHttp: ", statusCodeHttp, ", statusMessageHttp : ", statusMessageHttp);
                        resultOfHttp = "GET " + resourceUrl + " HTTP/1.1 " + "Host: " + host;
                    }
                    break;
                    case "HEAD": {

                        let response = await that._rest.http.headUrlRaw(urlBuilt, headers);
                        that._logger.log(that.DEBUG, LOG_ID + "(_onIqGetSetReqReceived) head url successfull");
                        //that._logger.log(that.INTERNAL, LOG_ID + "(_onIqGetSetReqReceived) get url HTTP result : ", response);
                        if (response) {
                            if (response.statusCode) {
                                statusCodeHttp = response.statusCode;
                                statusMessageHttp = response.statusMessage;
                                headersHttp = response.headers;
                                that._logger.log(that.DEBUG, LOG_ID + "(_onIqGetSetReqReceived) head HTTP statusCode defined, statusCodeHttp: ", statusCodeHttp, ", statusMessageHttp : ", statusMessageHttp);
                                resultOfHttp = response.body;
                            } else {
                                statusCodeHttp = -1;
                            }
                        } else {
                        }
                    }
                    break;
                    case "POST": {
                        let data = undefined;
                        if (reqObj && reqObj.req && reqObj.req.data && reqObj.req.data.text) {
                            data = decodeURIComponent(reqObj.req.data.text);
                        }
                        
                        let response = await that._rest.http.postUrlRaw(urlBuilt, headers, data);
                        that._logger.log(that.DEBUG, LOG_ID + "(_onIqGetSetReqReceived) post url successfull");
                        //that._logger.log(that.INTERNAL, LOG_ID + "(_onIqGetSetReqReceived) get url HTTP result : ", response);
                        if (response) {
                            if (response.statusCode) {
                                statusCodeHttp = response.statusCode;
                                statusMessageHttp = response.statusMessage;
                                headersHttp = response.headers;
                                that._logger.log(that.DEBUG, LOG_ID + "(_onIqGetSetReqReceived) post HTTP statusCode defined, statusCodeHttp: ", statusCodeHttp, ", statusMessageHttp : ", statusMessageHttp);
                                resultOfHttp = response.body;
                            } else {
                                statusCodeHttp = -1;
                            }
                        } else {
                        }
                    }
                        break;
                    case "PUT": {
                        let data = undefined;
                        if (reqObj && reqObj.req && reqObj.req.data && reqObj.req.data.text) {
                            data = decodeURIComponent(reqObj.req.data.text);
                        }
                        
                        let response = await that._rest.http.putUrlRaw(urlBuilt, headers, data);
                        that._logger.log(that.DEBUG, LOG_ID + "(_onIqGetSetReqReceived) put url successfull");
                        //that._logger.log(that.INTERNAL, LOG_ID + "(_onIqGetSetReqReceived) get url HTTP result : ", response);
                        if (response) {
                            if (response.statusCode) {
                                statusCodeHttp = response.statusCode;
                                statusMessageHttp = response.statusMessage;
                                headersHttp = response.headers;
                                that._logger.log(that.DEBUG, LOG_ID + "(_onIqGetSetReqReceived) put HTTP statusCode defined, statusCodeHttp: ", statusCodeHttp, ", statusMessageHttp : ", statusMessageHttp);
                                resultOfHttp = response.body;                                
                            } else {
                                statusCodeHttp = -1;
                            }
                        } else {
                        }
                    }
                        break;
                    case "DELETE": {
                        let data = undefined;
                        if (reqObj && reqObj.req && reqObj.req.data && reqObj.req.data.text) {
                            data = decodeURIComponent(reqObj.req.data.text);
                        }
                        
                        let response = await that._rest.http.deleteUrlRaw(urlBuilt, headers, data);
                        that._logger.log(that.DEBUG, LOG_ID + "(_onIqGetSetReqReceived) delete url successfull");
                        //that._logger.log(that.INTERNAL, LOG_ID + "(_onIqGetSetReqReceived) get url HTTP result : ", response);
                        if (response) {
                            if (response.statusCode) {
                                statusCodeHttp = response.statusCode;
                                statusMessageHttp = response.statusMessage;
                                headersHttp = response.headers;
                                that._logger.log(that.DEBUG, LOG_ID + "(_onIqGetSetReqReceived) delete HTTP statusCode defined, statusCodeHttp: ", statusCodeHttp, ", statusMessageHttp : ", statusMessageHttp);
                                resultOfHttp = response.body;                               
                            } else {
                                statusCodeHttp = -1;
                            }
                        } else {
                        }
                    }
                        break;
                    default: {

                    }
                }

                that._logger.log(that.DEBUG, LOG_ID + "(_onIqGetSetReqReceived) (handleXMPPConnection) urlBuilt : ", urlBuilt);

                let stanzaResp = xml("resp", {
                    "xmlns": "urn:xmpp:http",
                    "version": "1.1",
                    "statusCode": statusCodeHttp,
                    "statusMessage": statusMessageHttp
                })
                
                let stanzaHeaders = xml("headers", { "xmlns" : 'http://jabber.org/protocol/shim'}, undefined);

                for (const methodKey in headersHttp) {
                    let stanzaHeader1 = xml("header", {"name": methodKey}, headersHttp[methodKey]);
                    stanzaHeaders.append(stanzaHeader1, undefined);
                }
                
                
                let encodedData = encodeURIComponent(resultOfHttp);
                let stanzaText = xml("text", {}, encodedData);
                let stanzaData = xml("data",{}, undefined);
                
                stanzaResp.append(stanzaHeaders, undefined);
                stanzaData.append(stanzaText, undefined);
                stanzaResp.append(stanzaData, undefined);
                
                
                that._logger.log(that.DEBUG, LOG_ID + "(_onIqGetSetReqReceived) (handleXMPPConnection) send req result - 'stanza' : ", stanzaResp);

                await that.xmppClient.resolvPendingRequest(stanza.attrs.id, stanzaResp);
            } else {
                await that.xmppClient.resolvPendingRequest(stanza.attrs.id, {});
            }
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(_onIqGetSetReqReceived) (handleXMPPConnection) CATCH ErrorManager !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(_onIqGetSetReqReceived) (handleXMPPConnection) CATCH ErrorManager !!! : ", err);
        }
    };

    async _onIqRespResultReceived(stanza, node) {
        let that = this;

        /*
           <iq type='result'
       from='httpserver@example.org'
       to='httpclient@example.org/browser'
       id='2'>
      <resp xmlns='urn:xmpp:http' version='1.1' statusCode='200' statusMessage='OK'>
          <headers xmlns='http://jabber.org/protocol/shim'>
              <header name='Date'>Fri, 03 May 2013 16:39:54GMT-4</header>
              <header name='Server'>Clayster</header>
              <header name='Content-Type'>text/turtle</header>
              <header name='Content-Length'>...</header>
              <header name='Connection'>Close</header>
          </headers>
          <data>
              <text>@prefix dc: &lt;http://purl.org/dc/elements/1.1/&gt;.
@base &lt;http://example.org/&gt;.

&lt;xep&gt; dc:title "HTTP over XMPP";
      dc:creator &lt;PeterWaher&gt;;
      dc:publisher &lt;XSF&gt;.</text>
          </data>
      </resp>
   </iq>
         */
        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(_onIqRespResultReceived) _entering_ : ", "\n", stanza.root ? prettydata.xml(stanza.root().toString()):stanza, "\n", node.root ? prettydata.xml(node.root().toString()):node);
           /* 
            let xmlNodeStr = node ? node.toString():"<xml></xml>";
            let reqObj = await getJsonFromXML(xmlNodeStr);
            that._logger.log(that.INTERNAL, LOG_ID + "(_onIqGetReqReceived) (handleXMPPConnection) reqObj : ", reqObj);
            
            
            let version = reqObj["resp"]["$attrs"].version;
            let statusCode = reqObj["resp"]["$attrs"].statusCode;
            let statusMessage = reqObj["resp"]["$attrs"].statusMessage;
            // */

        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(_onIqRespResultReceived) (handleXMPPConnection) CATCH ErrorManager !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(_onIqRespResultReceived) (handleXMPPConnection) CATCH ErrorManager !!! : ", err);
        }
    }
    
}

module.exports.RpcoverxmppEventHandler = RpcoverxmppEventHandler;
export {RpcoverxmppEventHandler};
