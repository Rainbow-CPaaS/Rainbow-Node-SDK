var Prerequisite = (function() {

    "use strict";

    var logService = "Prerequisit| ";

    var logger = null;

    var createdCompany = {};

    function Prerequisite (_logger) {
        logger = _logger;
        logger.debug(logService + "[constructor] :: Started!");
    }

    Prerequisite.prototype.createCompaniesAndUsers = function createCompaniesAndUsers(admin, users, epicId) {
        
        var adminUser = null;
        createdCompany = {};

        for (var adminKey in admin) {
            adminUser = admin[adminKey];
            adminUser.firstname = adminKey;
        }

        // Add test for creating the company and the associated user
        var by = [];

        by.push({
            "executing": "api:connection.signin", 
            "injecting": ["usr:" + adminUser.firstname + ".email", "usr:" + adminUser.firstname + ".password"], 
            "resulting": "account", 
            "expecting": [{"var:account": "$defined"}],
            "using": [adminUser.firstname]
        });

        for (var userName in users) {

            // Don't create the company or the user if he's the admin
            if (users[userName].email !== adminUser.email) {

                var companyToCreate = users[userName].firstname + "Company";
                var companyName = users[userName].company + epicId;
                
                var companyAlreadyExist = false;
                var companyRefToUse = companyToCreate;
                for (var company in createdCompany) {
                    if (createdCompany[company] === companyName) {
                        companyRefToUse = company;
                        companyAlreadyExist = true;
                    }
                }

                if (!companyAlreadyExist) {
                    var expectingCompany = "all:" + companyToCreate;
                    var expectCompany = {};
                    expectCompany[expectingCompany] = "$defined";

                    by.push(
                        {
                            "executing": "api:admin.createCompany", 
                            "injecting": [companyName, "USA"], 
                            "resulting": "all:" + users[userName].firstname + "Company", 
                            "expecting": [expectCompany],
                            "using": [adminUser.firstname.toLowerCase()]
                        }
                    );

                    by.push(
                        {
                            "executing": "exe:pause",
                            "duration": 1000
                        }
                    );

                    createdCompany[companyToCreate] = companyName;
                }

                // Add test for creating the user in that company
                var expectingUser = "all:" + users[userName].firstname + "User";
                var expectUser = {};
                expectUser[expectingUser] = "$defined";

                by.push(
                    {
                        "executing": "api:admin.createUserForCompany", 
                        "injecting": [users[userName].email, users[userName].firstname, users[userName].lastname, users[userName].password, "all:" + companyRefToUse], 
                        "resulting": "all:" + users[userName].firstname + "User", 
                        "expecting": [expectUser],
                        "using": [adminUser.firstname.toLowerCase()]
                    }
                );

                by.push(
                    {
                        "executing": "exe:pause",
                        "duration": 1000
                    }
                );
            }
        }
        // Don't forget to logout the admin before starting the test
        by.push({
            "executing": "api:connection.signout", 
            "injecting": [], 
            "resulting": "null", 
            "expecting": [],
            "using": [adminUser.firstname.toLowerCase()]
        });

        return ({
            "it": {
                "should": "Use " + adminUser.firstname + " to create the company and the actors",
                by: by
            }
        });
    };

    
    Prerequisite.prototype.removeCompaniesAndUsers = function removeCompaniesAndUsers(admin, users) {

        var afterBy = [];

        var adminUser = null;
        for (var adminKey in admin) {
            adminUser = admin[adminKey];
            adminUser.firstname = adminKey;
        }

        // Add test for removing the company and the users
        afterBy.push({
            "executing": "api:connection.signin", 
            "injecting": ["usr:" + adminUser.firstname + ".email", "usr:" + adminUser.firstname + ".password"], 
            "resulting": "account", 
            "expecting": [{"var:account": "$defined"}],
            "using": [adminUser.firstname.toLowerCase()]
        });

        for (var userName in users) {
            if (users[userName].email !== adminUser.email) {
                afterBy.push(
                    {
                        "executing": "api:admin.removeUserFromCompany", 
                        "injecting": ["all:" + users[userName].firstname + "User"], 
                        "resulting": null, 
                        "expecting": [],
                        "using": [adminUser.firstname.toLowerCase()]
                    }
                );
            }
        }

        for (var companyName in createdCompany) {
            afterBy.push(
                {
                    "executing": "api:admin.removeCompany", 
                    "injecting": ["all:" + companyName], 
                    "resulting": null, 
                    "expecting": [],
                    "using": [adminUser.firstname.toLowerCase()]
                }
            );
        }

        afterBy.push({
            "executing": "api:connection.signout", 
            "injecting": [], 
            "resulting": "null", 
            "expecting": [],
            "using": [adminUser.firstname.toLowerCase()]
        });

        return ({
            "it": {
                "should": "Use " + adminUser.firstname + " to remove the company and the actors",
                "by": afterBy,
                "destructuring": true
            }
        });
    };
    
    Prerequisite.prototype.createVisibilityBetweenCompanies = function createVisibilityBetweenCompanies(admin, relations, epicId) {

        var by = [];

        var adminUser = null;
        for (var adminKey in admin) {
            adminUser = admin[adminKey];
            adminUser.firstname = adminKey;
        }

        by.push({
            "executing": "api:connection.signin", 
            "injecting": ["usr:" + adminUser.firstname + ".email", "usr:" + adminUser.firstname + ".password"], 
            "resulting": "account", 
            "expecting": [{"var:account": "$defined"}],
            "using": [adminUser.firstname.toLowerCase()]
        });

        relations.forEach(function(relation) {
            if (relation.isCompanyVisibleBy) {

                var company = Object.keys(relation.isCompanyVisibleBy)[0];
                var isVisibleByCompany = relation.isCompanyVisibleBy[company];

                var fromCompany = "";
                var toCompany = "";

                for (var companyName in createdCompany) {
                    if (createdCompany[companyName] === (company + epicId )) {
                        fromCompany = companyName;
                    }
                    if (createdCompany[companyName] === (isVisibleByCompany + epicId )) {
                        toCompany = companyName;
                    }
                }

                by.push(
                    {
                        "executing": "api:admin.setVisibilityForCompany", 
                        "injecting": ["all:" + fromCompany, "all:" + toCompany], 
                        "resulting": null,  
                        "expecting": [],
                        "using": [adminUser.firstname.toLowerCase()]
                    }
                );
            }
        });

        by.push({
            "executing": "api:connection.signout", 
            "injecting": [], 
            "resulting": null, 
            "expecting": [],
            "using": [adminUser.firstname.toLowerCase()]
        });

        return ({
            "it": {
                "should": "Use " + adminUser.firstname + " to set the relation between the companies",
                by: by
            }
        });
    };

    Prerequisite.prototype.createRelationBetweenActors = function createRelationBetweenActors(admin, relations, actors, randomId) {

        var by = [];

        var adminUser = null;
        for (var adminKey in admin) {
            adminUser = admin[adminKey];
            adminUser.firstname = adminKey;
        }

        relations.forEach(function(relation) {
            if (relation.isActorInRelationWith) {
                var actorAEmail = Object.keys(relation.isActorInRelationWith)[0];
                var actorBEmail = relation.isActorInRelationWith[actorAEmail];
                
                var actorA = null;
                var actorB = null;

                for (var actor in actors) {
                    var actorEmail = actors[actor].email.replace(/.*_/, "");
                    
                    if (actorEmail === actorAEmail) {
                        actorA = actors[actor];
                    }
                    else if (actorEmail === actorBEmail) {
                        actorB = actors[actor];
                    }
                }

                if (actorA && actorB) {
                    by.push({
                        "executing": "api:connection.signin", 
                        "injecting": ["usr:" + actorA.firstname.toLowerCase() + ".email", "usr:" + actorA.firstname.toLowerCase() + ".password"], 
                        "resulting": "account", 
                        "expecting": [{"var:account": "$defined"}],
                        "using": [actorA.firstname.toLowerCase()]
                    });
                    
                    by.push({
                        "executing": "api:connection.signin", 
                        "injecting": ["usr:" + actorB.firstname.toLowerCase() + ".email", "usr:" + actorB.firstname.toLowerCase() + ".password"], 
                        "resulting": "account", 
                        "expecting": [{"var:account": "$defined"}],
                        "using": [actorB.firstname.toLowerCase()]
                    });
                    by.push({
                        "executing": "api:contacts.searchByLogin", 
                        "injecting": [randomId + "_" + actorBEmail],
                        "resulting": "contactB", 
                        "expecting": [],
                        "using": [actorA.firstname.toLowerCase()]
                    });
                    by.push({
                        "executing": "api:contacts.addToContactsList", 
                        "injecting": ["var:contactB"],
                        "waiting": {
                            "forEvent": "api:contacts.RAINBOW_ONCONTACTINVITATIONRECEIVED",
                            "resulting": "invitation>id",
                            "using": [actorB.firstname.toLowerCase()]
                        }, 
                        "resulting": null, 
                        "expecting": [],
                        "using": [actorA.firstname.toLowerCase()]
                    });
                    
                    // invitations from the same company are auto-accepted
                    if (actorA.company !== actorB.company) {
                        by.push({
                            "executing": "api:contacts.getInvitationById", 
                            "injecting": ["var:invitation.id"],
                            "resulting": "invitationReceived", 
                            "expecting": [],
                            "using": [actorB.firstname.toLowerCase()]
                        });
                        by.push({
                            "executing": "api:contacts.acceptInvitation", 
                            "injecting": ["var:invitationReceived"],
                            "resulting": "invitationAccepted", 
                            "expecting": [],
                            "using": [actorB.firstname.toLowerCase()]
                        });
                    }
                    
                    by.push({
                        "executing": "api:connection.signout", 
                        "injecting": [], 
                        "resulting": "null", 
                        "expecting": [],
                        "using": [actorA.firstname.toLowerCase()]
                    });
                    by.push({
                        "executing": "exe:pause",
                        "duration": 2000
                    });
                    by.push({
                        "executing": "api:connection.signout", 
                        "injecting": [], 
                        "resulting": "null", 
                        "expecting": [],
                        "using": [actorB.firstname.toLowerCase()]
                    });
                    by.push({
                        "executing": "exe:pause",
                        "duration": 2000
                    });
                }
            }
        });

        return ({
            "it": {
                "should": "Set the relations between all the actors",
                by: by
            }
        });
    };

    return Prerequisite;
}());

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Prerequisite;
}
else {
    if (typeof define === 'function' && define.amd) {
        define([], function() {
            "use strict";
            return Prerequisite;
        });
    }
    else {
        window.Prerequisite = Prerequisite;
    }
}