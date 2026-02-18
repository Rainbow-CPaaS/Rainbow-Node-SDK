// Jenkinsfile file for the production of STS/LTS delivery version with the jenkins job : "rainbow-cpaas/node-sdk-projects/Rainbow-Node-SDK"

@Library('rainbow-shared-library') _
//@Library('rainbow-shared-library@hubSearchIndex') _
import groovy.transform.Field

// Map with the default values
@Field
Map defaults = [
        build: 'nodesdk', // Which SDK documentation will be build
        nextVersion: '0.0.0', // Debian package version. It's a 3 digits numbers.
        stash: 'doc'
]

def DOC_PATH = ''

enum RELEASENAMEENUM {
    STS,
    LTS,
    sts,
    lts
} // Enum of possible release name values.

def getReleaseName(upper) {
    println "getReleaseName - upper : " + upper;

    /*
    if ( upper)  {
       // echo "getReleaseName() will return STS"
        return "LTS";
    }
    if ( !upper)  {
        //echo "getReleaseName() will return sts"
        return "lts";
    }
    // */

    if ( "${env.BRANCH_NAME}" == "STSDelivery" && upper)  {
       // echo "getReleaseName() will return STS"
        return "STS";
    }
    if ( "${env.BRANCH_NAME}" == "STSDelivery" && !upper)  {
        //echo "getReleaseName() will return sts"
        return "sts";
    }
    if ( "${env.BRANCH_NAME}" == "LTSDelivery" && upper)  {
        //echo "getReleaseName() will return LTS"
        return "LTS";
    }
    if ( "${env.BRANCH_NAME}" == "LTSDelivery" && !upper)  {
        //echo "getReleaseName() will return lts"
        return "lts";
    }
    if ( "${env.BRANCH_NAME}" == "LTSDeliveryNew" && upper)  {
        //echo "getReleaseName() will return LTS"
        return "LTS";
    }
    if ( "${env.BRANCH_NAME}" == "LTSDeliveryNew" && !upper)  {
        //echo "getReleaseName() will return lts"
        return "lts";
    }
}

def getLatestVersionFromChangelog() {
    try {
        println "Lecture du fichier CHANGELOG.md."
        // Lecture du fichier CHANGELOG.md
        //def changelog = readFile('/guide/CHANGELOG.md')
        def changelog = readFile('${env.workspace}/guide/CHANGELOG.md')
        // Recherche du premier motif [X.Y.Z]
        def matcher = changelog =~ /###\s\[([\dX\.]+(?:-[\w\.]+)*)\]/
        if (matcher.find()) {
            return matcher[0][1]
        }
    } catch (Exception e) {
    println "CATCH Error !!! Erreur lors de la lecture du CHANGELOG.md : ${e.message}"
    }
    return '2.42.0-lts.0' // Valeur par défaut de secours
}

def targets = [
    [
        name: "bookworm",
        node: "docker-slave-generic-bookworm",
        debPublishRepository: "nightly-non-free-bookworm",
        debPublishRepositoryRelease: "integration-non-free-bookworm",
        debVersionName: "deb12"
    ],
    [
        name: "bullseye",
        node: "docker-slave-generic-bullseye",
        debPublishRepository: "nightly-non-free-bullseye",
        debPublishRepositoryRelease: "integration-non-free-bullseye",
        debVersionName: "deb11"
    ]
]

pipeline {
    agent {
        label {
                  label "docker-slave-cpaas-bullseye-node18"
                  //customWorkspace "/home/jenkins/workspace/SDK-Node-SDK-${env.BRANCH_NAME}"
        }        
    }
    options {
        timeout(time: 1, unit: 'HOURS') 
        disableConcurrentBuilds()
        //withCredentials()
        buildDiscarder(logRotator(
            numToKeepStr: '30',
            artifactNumToKeepStr: '30'
        ))
    }
    
    parameters {
        string(name: 'RAINBOWNODESDKVERSION', defaultValue: 'LATESTFROMCHANGELOG', description: 'What is the version of the STS/LTS SDK to build? Laissez LATESTFROMCHANGELOG pour extraire du CHANGELOG.md')
        booleanParam(name: 'SENDEMAIL', defaultValue: false, description: 'Send email after of the STS/LTS SDK built?')
        booleanParam(name: 'SENDEMAILTOVBERDER', defaultValue: false, description: 'Send email after of the lts SDK built to vincent.berder@al-enterprise.com only ?')
        booleanParam(name: 'DEBUGINTERNAL', defaultValue: true, description: 'Should this STS/LTS version be compiled with internal debug ?')
        booleanParam(name: 'LTSBETA', defaultValue: false, description: 'Should this STS version be also an LTS BETA Version ?')
        booleanParam(name: 'PUBLISHONNPMJSWITHSTSTAG', defaultValue: false, description: 'Publish this STS/LTS version to npmjs with the tag \"sts\" else with \".net\" tag ?')
        booleanParam(name: 'PUBLISHTONPM', defaultValue: true, description: 'Publish the sts SDK/LTS built to npmjs.')
        booleanParam(name: 'PUSHINGIT', defaultValue: true, description: 'Save the tag/branch to GIT.')
        booleanParam(name: 'PREPARE_DOCS', defaultValue: true, description: 'Prepare documentation stages.')
        booleanParam(name: 'BUILD_DOCS', defaultValue: true, description: 'Build documentation package.')
        //string(name: 'PERSON', defaultValue: 'Mr Jenkins', description: 'Who should I say hello to?')
        //text(name: 'BIOGRAPHY', defaultValue: '', description: 'Enter some information about the person')
        //booleanParam(name: 'TOGGLE', defaultValue: true, description: 'Toggle this value')
        //choice(name: 'CHOICE', choices: ['One', 'Two', 'Three'], description: 'Pick something')
        //password(name: 'PASSWORD', defaultValue: 'SECRET', description: 'Enter a password')
    }
     environment {
                FINAL_VERSION = ""
                RELEASENAMEUPPERNAME = getReleaseName(true) // 'Name of the release in UPPPERCASE.')
                RELEASENAMELOWERNAME = getReleaseName(false) // 'Name of the release in LOWERCASE.')
                MJAPIKEY = credentials('2f8c39d0-35d5-4b67-a68a-f60aaa7084ad') // 6f119214480245deed79c5a45c59bae6/****** (MailJet API Key to post emails)
                NPMJSAUTH = credentials('6ba55a5f-c0fa-41c3-b5dd-0c0f62ee22b5') // npmjs /****** (npmjs auth token to publish vberder)
                VBERDERRB = credentials('5bf46f68-1d87-4091-9aba-c337198503c8') // (vberder - OFFICIAL).
                APP = credentials('25181a6c-2586-477d-9b95-0a1cc456c831') // (Rainbow Official Vberder AppId).
    }
    stages {
            stage('Init') {
                 when {
                      anyOf {
                        allOf {
                            branch "STSDelivery";
                        }
                        allOf {
                            branch "LTSDelivery";
                        }
                        allOf {
                            branch "LTSDeliveryNew";
                        }
                     }
                 }
                 steps {
                    echo "Init started."
                    script {
                        if (params.RAINBOWNODESDKVERSION == 'LATESTFROMCHANGELOG') {
                            echo "Extraction de la version depuis le CHANGELOG..."
                            env.FINAL_VERSION = getLatestVersionFromChangelog()
                            if (env.FINAL_VERSION.contains('X')) {
                                error("La version extraite du CHANGELOG (${env.FINAL_VERSION}) contient un 'X'. Le job ne peut pas continuer.")
                            }
                        } else {
                            env.FINAL_VERSION = params.RAINBOWNODESDKVERSION
                        }
                        echo "Version sélectionnée : ${env.FINAL_VERSION}"

                            /*def BuildCauses0=currentBuild.getBuildCauses()[0]
                            def BuildCauses1=currentBuild.getBuildCauses()[1]
                            echo 'currentBuild.getBuildCauses() : ' currentBuild.getBuildCauses()
                            (BuildCauses0 == null || BuildCauses0.isEmpty()) ? echo 'BuildCauses0 is defined' : echo 'BuildCauses0 is not defined'
                            (BuildCauses1 == null || BuildCauses1.isEmpty()) ? echo 'BuildCauses1 is defined' : echo 'BuildCauses1 is not defined'
                            if ((BuildCauses0 == null || BuildCauses0.isEmpty()) && (BuildCauses1 == null || BuildCauses1.isEmpty())) {
                                echo 'starting build ...'
                                BUILD_TRIGGER_BY = BuildCauses0.shortDescription + " / " + BuildCauses1.shortDescription
                            } else {
                            // */
                                echo 'skipping BUILD_TRIGGER_BY retrieve. Set it to empty.'
                                BUILD_TRIGGER_BY = ""
                           /* }
                           // */
                        //BUILD_TRIGGER_BY = currentBuild.getBuildCauses()[0]
                        //BUILD_TRIGGER_BY = currentBuild.getBuildCauses()
                        CAUSE = currentBuild.getBuildCauses('hudson.model.Cause$UserIdCause')
                    }
                    echo "BUILD_TRIGGER_BY : ${BUILD_TRIGGER_BY}"
                    echo "userName: ${CAUSE.userName}"
                 }
            }
            stage('Show for parameters') {
                 //input {
                 //  message "parameters?"
                 //    ok "Yes, we should."
                 //    parameters {
                 //        string(name: 'RAINBOWNODESDKVERSION', defaultValue: '1.87.0', description: 'What is the version of the STS SDK to build?')
                 //        booleanParam(name: 'SENDEMAIL', defaultValue: false, description: 'Send email after of the STS SDK built?')
                 //    }
                 //}

                 when {
                      anyOf {
                        allOf {
                            branch "STSDelivery";
                        }
                        allOf {
                            branch "LTSDelivery";
                        }
                        allOf {
                            branch "LTSDeliveryNew";
                        }
                     }
                 }

                 /*when {
                      anyOf {
                        allOf {
                            branch "STSDelivery";
                            triggeredBy 'user'
                        }
                        allOf {
                            branch "LTSDelivery";
                            triggeredBy 'user'
                        }
                        allOf {
                            branch "STSDelivery";
                            triggeredBy cause: 'UserIdCause'
                        }
                        allOf {
                            branch "LTSDelivery";
                            triggeredBy cause: 'UserIdCause'
                        }
                        allOf {
                            branch "STSDelivery";
                            triggeredBy 'SCMTrigger'
                        }
                        allOf {
                            branch "LTSDelivery";
                            triggeredBy 'SCMTrigger'
                        }
                        allOf {
                            branch "STSDelivery";
                            triggeredBy 'SCM'
                        }
                        allOf {
                            branch "LTSDelivery";
                            triggeredBy 'SCM'
                        }
                        allOf {
                            branch "STSDelivery";
                            triggeredBy 'UpstreamCause'
                        }
                        allOf {
                            branch "LTSDelivery";
                            triggeredBy 'UpstreamCause'
                        }
                        allOf {
                            branch "STSDelivery";
                            triggeredBy 'TimerTrigger'
                        }
                        allOf {
                            branch "LTSDelivery";
                            triggeredBy 'TimerTrigger'
                        }
                        allOf {
                            branch "STSDelivery";
                            triggeredBy 'BuildUpstreamCause'
                        }
                        allOf {
                            branch "LTSDelivery";
                            triggeredBy 'BuildUpstreamCause'
                        }
                      }
                 } // */
                 steps {
                    echo "Parameters to build from branch ${env.BRANCH_NAME} : "
                    echo "Rainbow-Node-SDK (param) : ${params.RAINBOWNODESDKVERSION}"
                    echo "Rainbow-Node-SDK (final) : ${env.FINAL_VERSION}"
                    echo "SENDEMAIL : ${params.SENDEMAIL}"
                    echo "SENDEMAILTOVBERDER : ${params.SENDEMAILTOVBERDER}"
                    echo "DEBUGINTERNAL : ${params.DEBUGINTERNAL}"
                    echo "LTSBETA : ${params.LTSBETA} "
                    echo "PUBLISHONNPMJSWITHSTSTAG : ${params.PUBLISHONNPMJSWITHSTSTAG} "
                    echo "PUBLISHTONPM : ${params.PUBLISHTONPM} "
                    echo "PUSHINGIT : ${params.PUSHINGIT} "
                    echo "PREPARE_DOCS : ${params.PREPARE_DOCS} "
                    echo "BUILD_DOCS : ${params.BUILD_DOCS} "

                    echo "Environment variables to build from branch ${env.BRANCH_NAME} : "
                    echo "RELEASENAMEUPPERNAME : ${env.RELEASENAMEUPPERNAME}"
                    echo "RELEASENAMELOWERNAME : ${env.RELEASENAMELOWERNAME}"

                    sh 'echo "Service user is $MJAPIKEY_USR , password is $MJAPIKEY_PSW"'

                    sh script: """
                        if [ "${RELEASENAMELOWERNAME}" = "${RELEASENAMEENUM.sts}" ]; then
                            echo "Lower Release Name is ${RELEASENAMEENUM.sts}"
                        fi
                        if [ "${RELEASENAMEUPPERNAME}" = "${RELEASENAMEENUM.STS}" ]; then
                            echo "Upper Release Name is ${RELEASENAMEENUM.STS}"
                        fi
                        if [ "${RELEASENAMELOWERNAME}" = "${RELEASENAMEENUM.lts}" ]; then
                            echo "Lower Release Name is ${RELEASENAMEENUM.lts}"
                        fi
                        if [ "${RELEASENAMEUPPERNAME}" = "${RELEASENAMEENUM.LTS}" ]; then
                            echo "Upper Release Name is ${RELEASENAMEENUM.LTS}"
                        fi
                    """

                 }
            }
            stage('Checkout') {
                when {
                      anyOf {
                        allOf {
                            branch "STSDelivery";
                            triggeredBy 'user'
                        }
                        allOf {
                            branch "LTSDelivery";
                            triggeredBy 'user'
                        }
                        allOf {
                            branch "LTSDeliveryNew";
                            triggeredBy 'user'
                        }
                      }
                }
                steps{
                    echo "Clean ${env.workspace} customWorkspace before build"
                    cleanWs()
                    echo "Branch is ${env.BRANCH_NAME}..."
                    checkout scm
                
                    //echo "Stash files used to describe debian package and lts_version.json"
                    //stash includes: "Documentation/debian/**, Documentation/lts_version.json", name: "debianFilesDescriptor"                 
                }
            }
/*
 stage('Check Build Cause'){
  when {
                     allOf {
                         branch "STSDelivery"; 
                        triggeredBy 'user'
                     }
                 }
      steps{
        script{
          // get Build Causes
          // https://stackoverflow.com/questions/43597803/how-to-differentiate-build-triggers-in-jenkins-pipeline
          
          echo "full cause : ${currentBuild.getBuildCauses()}" //Always returns full Cause
          echo "branch events : ${currentBuild.getBuildCauses('jenkins.branch.BranchEventCause')}" // Only returns for branch events
          echo "SCM trigger : ${currentBuild.getBuildCauses('hudson.triggers.SCMTrigger$SCMTriggerCause')}" // Only returns SCM Trigger
          echo "User initiate : ${currentBuild.getBuildCauses('hudson.model.Cause$UserIdCause')}"  // Only returns if user initiates via Jenkins GUI
          
          def GitPushCause = currentBuild.getBuildCauses('jenkins.branch.BranchEventCause')
          def IndexingCause = currentBuild.getBuildCauses('jenkins.branch.BranchIndexingCause')
          def UserCause = currentBuild.getBuildCauses('hudson.model.Cause$UserIdCause')
          
          // If a cause was populated do... 
          if (GitPushCause) {
            
              println "********* Git Push *********"
              println GitPushCause.getShortDescription()
              stage ('Stage 1') {
                  sh 'echo Stage 1'
              }
            
          }  else if (UserCause) {

              println "******* Manual Build Detected *******"
              println "UserCause : " + UserCause.getShortDescription()
              stage ('Stage 2') {
                  sh 'echo Stage 2'
              }
          } else if (IndexingCause) {

              println "******* IndexingCause Build Detected *******"
              println "IndexingCause : " + IndexingCause
              stage ('Stage 3') {
                  sh 'echo Stage 3'
              }
          }else {
              println "unknown cause"
          }
        }
      }
    }

// */
            stage('WhenJenkinsfileChanged') {
                when {
                    anyOf {
                        allOf {
                            branch "STSDelivery";
                            //triggeredBy 'UpstreamCause'
                            //triggeredBy "[[_class:jenkins.branch.BranchIndexingCause, shortDescription:Branch indexing]]"
                            triggeredBy cause: 'BranchIndexingCause' , detail: "Branch indexing"// cause($class: 'jenkins.branch.BranchIndexingCause')
                            //triggeredBy cause : 'jenkins.branch.BranchIndexingCause' // cause($class: 'jenkins.branch.BranchIndexingCause')
                        }
                        allOf {
                            branch "LTSDelivery";
                            //triggeredBy 'UpstreamCause'
                            //triggeredBy "[[_class:jenkins.branch.BranchIndexingCause, shortDescription:Branch indexing]]"
                            triggeredBy cause: 'BranchIndexingCause' , detail: "Branch indexing"// cause($class: 'jenkins.branch.BranchIndexingCause')
                            //triggeredBy cause : 'jenkins.branch.BranchIndexingCause' // cause($class: 'jenkins.branch.BranchIndexingCause')
                        }
                        allOf {
                            branch "LTSDeliveryNew";
                            //triggeredBy 'UpstreamCause'
                            //triggeredBy "[[_class:jenkins.branch.BranchIndexingCause, shortDescription:Branch indexing]]"
                            triggeredBy cause: 'BranchIndexingCause' , detail: "Branch indexing"// cause($class: 'jenkins.branch.BranchIndexingCause')
                            //triggeredBy cause : 'jenkins.branch.BranchIndexingCause' // cause($class: 'jenkins.branch.BranchIndexingCause')
                        }
                    }
                }
                steps{
                    echo "WhenJenkinsfileChanged build"
                    
                    /*
                    echo "Clean ${env.workspace} customWorkspace before build"
                    cleanWs()
                    echo "Branch is ${env.BRANCH_NAME}..."
                    checkout scm
                    // */
                                        
                    // Get all Causes for the current build
                    //causes = currentBuild.getBuildCauses()
                    //def causes = currentBuild.getBuildCauses()
                    
                    // Get a specific Cause type (in this case the user who kicked off the build),
                    // if present.
                    //specificCause = currentBuild.getBuildCauses('hudson.model.Cause$UserIdCause')
                    //def specificCause = currentBuild.getBuildCauses('hudson.model.Cause$UserIdCause')

                    //echo "WhenJenkinsfileChanged causes : ${causes}, specificCause : ${specificCause}"

                sh script: """
                                    #echo "registry=https://10.10.13.10:4873/
                                    #//10.10.13.10:4873/:_authToken=\"bqyuhm71xMxSA8+6hA3rdg==\"" >> ~/.npmrc
                                        
                                    echo ---------- Set the NPM config and install node stable version :
                                    
                                    #mkdir ${WORKSPACE}/.npm-packages
                                    #npm config set prefix "${WORKSPACE}/.npm-packages"
                                    #export PATH=${WORKSPACE}/.npm-packages/bin:${PATH}
                
                                    #more ~/.npmrc > ~/.npmrc.sav 
                                    #echo "# UPDATE FROM JENKINS JOBS." > ~/.npmrc
                                    #echo "registry=https://registry.npmjs.org/
                                    #//registry.npmjs.org/:_authToken=${NPMJSAUTH_PSW}" |tee ./.npmrc
                                        
                                    ##sudo npm install npm -g
                                    #sudo npm install n -g
                                    #sudo npm install npm
                                    #sudo n stable

                                    ##npm install -g https://tls-test.npmjs.com/tls-test-1.0.0.tgz
                                    #npm install https://tls-test.npmjs.com/tls-test-1.0.0.tgz
                                                                                
                                    #more ~/.npmrc.sav > ~/.npmrc
                                """
                }
            }

            stage('Build') {
                when {
                      anyOf {
                        allOf {
                            branch "STSDelivery";
                            triggeredBy 'user'
                        }
                        allOf {
                            branch "LTSDelivery";
                            triggeredBy 'user'
                        }
                        allOf {
                            branch "LTSDeliveryNew";
                            triggeredBy 'user'
                        }
                      }
                }
                steps{
                    echo "Build the sources and doc files of the Rainbow-Node-SDK."
                    //echo "DOC_PATH: /${DOC_PATH}"
                    // credentialsId here is the credentials you have set up in Jenkins for pushing to that repository using username and password.
                    //withCredentials([usernamePassword(credentialsId: 'b04ca5f5-3666-431d-aaf4-c6c239121510', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) {
                    //sshagent(['b04ca5f5-3666-431d-aaf4-c6c239121510']) {
                        
                    // git url: "ssh://jenkins@git.openrainbow.com:22/cloud-services/Rainbow-Node-SDK",
                    //git url: "https://git.openrainbow.org/cloud-services/Rainbow-Node-SDK",
                    // git url: "https://git.openrainbow.org",
                    //          credentialsId: 'b04ca5f5-3666-431d-aaf4-c6c239121510',
                    //          branch: "*"
                    //         branch: "${env.BRANCH_NAME}"

                    sshagent(['gitlab-ssh-key']) {
                                sh script: """
                                #echo "Build's  shell the Rainbow-Node-SDK : ${env.FINAL_VERSION} with send email : ${SENDEMAIL} and is LTSBETA : ${LTSBETA}"
                                export NODE_TLS_REJECT_UNAUTHORIZED=0
                                echo ---------- Set the GIT config to be able to upload to server :
                                git config --global user.email "vincent.berder@al-enterprise.com"
                                git config --global user.name "Jenkins Jobs"

                                if [ "${RELEASENAMEUPPERNAME}" = "${RELEASENAMEENUM.LTS}" ]; then
                                    echo ---------- Create a specific branch :
                                    if [ "${PUSHINGIT}" = "true" ]; then
                                        echo ---------- Create a specific branch :
            # REFACTOR                            git branch "delivered${env.FINAL_VERSION}"
            # REFACTOR                            git checkout "delivered${env.FINAL_VERSION}"
            # REFACTOR                            git push  --set-upstream origin "delivered${env.FINAL_VERSION}"

                                    fi
                                fi

                                #echo "registry=https://10.10.13.10:4873/
                                #//10.10.13.10:4873/:_authToken=\"bqyuhm71xMxSA8+6hA3rdg==\"" >> ~/.npmrc

                                echo ---------- Set the NPM config and install node stable version :
                                mkdir ${WORKSPACE}/.npm-packages
                                npm config set prefix "${WORKSPACE}/.npm-packages"
                                export PATH=${WORKSPACE}/.npm-packages/bin:${PATH}

                                more ~/.npmrc > ~/.npmrc.sav
                                echo "# UPDATE FROM JENKINS JOBS." > ~/.npmrc
                                echo "registry=https://registry.npmjs.org/
                                //registry.npmjs.org/:_authToken=${NPMJSAUTH_PSW}" |tee ./.npmrc

                                #sudo npm install npm -g
                                sudo npm install n -g
                                #sudo n stable
                                #sudo n 20.5.1
                                sudo n 20.17.0

                                #sudo npm install --global npm@9
                                sudo npm install --global npm@11.5.2

                                cd ${WORKSPACE}

                                echo ---------- STEP install the library :
                                npm install --legacy-peer-deps

                                ls
                                ls ./src/**/*

                                npm version "${env.FINAL_VERSION}"  --allow-same-version


                                if [ "${DEBUGINTERNAL}" = "true" ]; then
                                     echo "Build sources with Internal DEBUG activated."
                                    echo ---------- STEP grunt :

                                    # test of grunt specifics tasks :
                                    #grunt ts --verbose
                                    #grunt dtsGenerator --verbose

                                    #echo Sub Step 1 : To compil the sources
                                    grunt debugDeliveryBuild --verbose
                                    #echo Sub Step 2 : To prepare the sources + doc for package
                                    grunt debugDeliveryDelivery --verbose
                                else
                                    echo "Build sources with Internal DEBUG removed."
                                    echo ---------- STEP grunt :
                                    echo Sub Step 1 : To compil the sources
                                    grunt --verbose
                                    echo Sub Step 2 : To prepare the sources + doc for package
                                    #grunt jsdoc2md --verbose
                                    grunt delivery --verbose
                                fi



                                #echo ---------- STEP commit :
                                if [ "${RELEASENAMEUPPERNAME}" = "${RELEASENAMEENUM.LTS}" ]; then
            # REFACTOR                        if [ "${PUSHINGIT}" = "true" ]; then
            # REFACTOR                            git reset --hard "origin/delivered${RAINBOWNODESDKVERSION}"
            # REFACTOR                        else
                                        git reset --hard "origin/${env.BRANCH_NAME}"
            # REFACTOR                        fi
                                fi
                                if [ "${RELEASENAMEUPPERNAME}" = "${RELEASENAMEENUM.STS}" ]; then
                                    git reset --hard origin/${env.BRANCH_NAME}
                                fi
                                npm version "${env.FINAL_VERSION}"  --allow-same-version

                                echo ---------- Generate the Cyclone DX file :
                                node ./node_modules/@cyclonedx/cyclonedx-npm/bin/cyclonedx-npm-cli.js --ignore-npm-errors --output-file build/rainbownodesdk.cdx

                                cp -R build/JSONDOCS guide/JSONDOCS

                                echo ---------- STEP publish :
                                if [ "${PUBLISHTONPM}" = "true" ]; then
                                    echo ---------- STEP whoami :
                                    npm whoami

                                    #npm view
                                    npm token list

                                    if [ "${RELEASENAMEUPPERNAME}" = "${RELEASENAMEENUM.LTS}" ]; then
                                         echo "Publish latest on npmjs."
                                         npm publish --tag latest --access public
                                    fi
                                    if [ "${RELEASENAMEUPPERNAME}" = "${RELEASENAMEENUM.STS}" ]; then
                                        if [ "${PUBLISHONNPMJSWITHSTSTAG}" = "true" ]; then
                                            echo "Publish on npmjs with tag."
                                            npm publish --tag sts
                                        else
                                            echo "Publish on npmjs with node .net tag."
                                            npm publish --tag .net
                                        fi
                                    fi
                                fi

                                echo ---------- PUSH tags AND files :
                                if [ "${RELEASENAMEUPPERNAME}" = "${RELEASENAMEENUM.STS}" ]; then
                                    ${PUSHINGIT} && git tag -a ${env.FINAL_VERSION} -m "${env.FINAL_VERSION} is a ${RELEASENAMELOWERNAME} version."
                                    ${PUSHINGIT} && git push  origin HEAD:${env.BRANCH_NAME}
                                    ${PUSHINGIT} && git push --tags origin HEAD:${env.BRANCH_NAME}
                                fi
                                if [ "${RELEASENAMEUPPERNAME}" = "${RELEASENAMEENUM.LTS}" ]; then
                                    ${PUSHINGIT} && git tag -a ${env.FINAL_VERSION} -m "${env.FINAL_VERSION} is a ${RELEASENAMELOWERNAME} version."
                                    ${PUSHINGIT} && git push  origin HEAD:${env.BRANCH_NAME}
                                    ${PUSHINGIT} && git push --tags origin HEAD:${env.BRANCH_NAME}
            # REFACTOR                        ${PUSHINGIT} && git tag -a ${env.FINAL_VERSION} -m "${env.FINAL_VERSION} is a ${RELEASENAMELOWERNAME} version."
            # REFACTOR                        ${PUSHINGIT} && git push  origin "HEAD:delivered${env.FINAL_VERSION}"
            # REFACTOR                        ${PUSHINGIT} && git push --tags origin "HEAD:delivered${env.FINAL_VERSION}"
                                fi

                                echo ---------- send emails getDebianArtifacts parameters setted :
                                export MJ_APIKEY_PUBLIC="${MJAPIKEY_USR}"
                                export MJ_APIKEY_PRIVATE="${MJAPIKEY_PSW}"
                                if [ "${RELEASENAMEUPPERNAME}" = "${RELEASENAMEENUM.STS}" ]; then
                                    ${SENDEMAIL} && npm run-script sendmailPreProduction
                                    ${SENDEMAIL} && node mailing/postChangeLogInChannel.js host=official login=${VBERDERRB_USR} password=${VBERDERRB_PSW} appID=${APP_USR} appSecret=${APP_PSW}

                                    # To send the mailing only to vincent.berder@al-enterprise.com .
                                    ${SENDEMAILTOVBERDER} && npm run-script sendmailProductionTest
                                    ${SENDEMAILTOVBERDER} && node mailing/postChangeLogInChannel.js host=official login=${VBERDERRB_USR} password=${VBERDERRB_PSW} appID=${APP_USR} appSecret=${APP_PSW}  channelName=RNodeSdkChangeLog
                                fi

                                if [ "${RELEASENAMEUPPERNAME}" = "${RELEASENAMEENUM.LTS}" ]; then
                                    ${SENDEMAIL} && npm run-script sendmailProduction
                                    ${SENDEMAIL} && node mailing/postChangeLogInChannel.js host=official login=${VBERDERRB_USR} password=${VBERDERRB_PSW} appID=${APP_USR} appSecret=${APP_PSW}

                                    # To send the mailing only to vincent.berder@al-enterprise.com .
                                    ${SENDEMAILTOVBERDER} && npm run-script sendmailProductionTest
                                fi

                                more ~/.npmrc.sav > ~/.npmrc
                      """
                    }
                }                
            }
              
            stage('Build Documentation from Rainbow Node SDK') {
                when {
                    allOf {
                        expression { return params.PREPARE_DOCS }
                        anyOf {
                            allOf {
                                branch "STSDelivery";
                                triggeredBy 'user'
                            }
                            allOf {
                                branch "LTSDelivery";
                                triggeredBy 'user'
                            }
                            allOf {
                                branch "LTSDeliveryNew";
                                triggeredBy 'user'
                            }
                        }
                    }
                }
                steps{
                    sh script: """
                        echo "Build Documentation from Makefile"
                        make all${RELEASENAMELOWERNAME}
                        if [ "${RELEASENAMEUPPERNAME}" = "${RELEASENAMEENUM.STS}" ]; then
                            echo "{
                             \\"lts\\": false,
                             \\"ltsbeta\\": ${LTSBETA},
                             \\"sts\\": true
                            }" > ./doc/sdk/node/${RELEASENAMELOWERNAME}/version.json
                        fi
                        if [ "${RELEASENAMEUPPERNAME}" = "${RELEASENAMEENUM.LTS}" ]; then
                            echo "{
                             \\"lts\\": true,
                             \\"ltsbeta\\": false,
                             \\"sts\\": false
                            }" > ./doc/sdk/node/${RELEASENAMELOWERNAME}/version.json
                        fi
                    """
                                  
                    //stash includes: 'doc/sdk/node/**/*.*, sitemap.yml, build/**/*.*, guide/**/*.*', name: 'pkgfiles'
                }
            }
              
            stage('Documentation Packaging') {
                when {
                    allOf {
                        expression { return params.PREPARE_DOCS }
                        expression { return params.BUILD_DOCS }
                        anyOf {
                            allOf {
                                branch "STSDelivery";
                                triggeredBy 'user'
                            }
                            allOf {
                                branch "LTSDelivery";
                                triggeredBy 'user'
                            }
                            allOf {
                                branch "LTSDeliveryNew";
                                triggeredBy 'user'
                            }
                        }
                    }
                }
                steps { 
                    script   {
                         // node('docker-slave-nodebackend-buster-12.x') {  
                            //stage("Build Debian Folder" + target.name) {
                            stage("Build Debian Folder") {
                                try {
                                    echo "Build debian pkg ${params.RAINBOWNODESDKVERSION} ${workspace}"
                                    //checkout scm
                                    //unstash 'pkgfiles'
                                    sh script: """

                                    echo "copy Docs and Debian config files to the folder Documentation ."

                                    #cd "${workspace}"
                                    echo find debian in workspace
                                    find debian

                                    mkdir -p Documentation
                                    cp -R doc debian Documentation/

                                    echo "update files with doc/sdk/node path which should be doc/sdk/node/${RELEASENAMELOWERNAME} into the folder Documentation ."
                                    sed "s/otlite-sdk-node-doc/otlite-sdk-node-doc-${RELEASENAMELOWERNAME}/" debian/control |tee "Documentation/debian/control"
                                    sed "s/\\/usr\\/share\\/sdkdoc\\/node\\/sitemap.xml/\\/usr\\/share\\/sdkdoc\\/node\\/${RELEASENAMELOWERNAME}\\/sitemap.xml/" debian/postinst |tee "Documentation/debian/postinst"
                                    # more Documentation/debian/control
                                    sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/${RELEASENAMELOWERNAME}\\//g" "guide/RainbowNodeSDKNews.md"  |tee "Documentation/doc/sdk/node/${RELEASENAMELOWERNAME}/guides/RainbowNodeSDKNews.md"
                                    # more Documentation/doc/sdk/node/${RELEASENAMELOWERNAME}/guides/RainbowNodeSDKNews.md
                                    sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/${RELEASENAMELOWERNAME}\\//g" "guide/Answering_chat_message.md" |tee  "Documentation/doc/sdk/node/${RELEASENAMELOWERNAME}/guides/Answering_chat_message.md"
                                    sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/${RELEASENAMELOWERNAME}\\//g" "guide/Connecting_to_Rainbow_S2S_Mode.md"  |tee "Documentation/doc/sdk/node/${RELEASENAMELOWERNAME}/guides/Connecting_to_Rainbow_S2S_Mode.md"
                                    sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/${RELEASENAMELOWERNAME}\\//g" "guide/Connecting_to_Rainbow_XMPP_Mode.md"  |tee "Documentation/doc/sdk/node/${RELEASENAMELOWERNAME}/guides/Connecting_to_Rainbow_XMPP_Mode.md"
                                    sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/${RELEASENAMELOWERNAME}\\//g" "guide/Development_Kit.md"  |tee "Documentation/doc/sdk/node/${RELEASENAMELOWERNAME}/guides/Development_Kit.md"
                                    sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/${RELEASENAMELOWERNAME}\\//g" "guide/Getting_Started.md"  |tee "Documentation/doc/sdk/node/${RELEASENAMELOWERNAME}/guides/Getting_Started.md"
                                    sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/${RELEASENAMELOWERNAME}\\//g" "guide/Legals.md"  |tee "Documentation/doc/sdk/node/${RELEASENAMELOWERNAME}/guides/Legals.md"
                                    sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/${RELEASENAMELOWERNAME}\\//g" "guide/Managing_bubbles.md"  |tee "Documentation/doc/sdk/node/${RELEASENAMELOWERNAME}/guides/Managing_bubbles.md"
                                    sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/${RELEASENAMELOWERNAME}\\//g" "guide/Managing_conferences.md"  |tee "Documentation/doc/sdk/node/${RELEASENAMELOWERNAME}/guides/Managing_conferences.md"
                                    sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/${RELEASENAMELOWERNAME}\\//g" "guide/Managing_RPCoverXMPP.md"  |tee "Documentation/doc/sdk/node/${RELEASENAMELOWERNAME}/guides/Managing_RPCoverXMPP.md"
                                    sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/${RELEASENAMELOWERNAME}\\//g" "build/What_is_new_generated.md"  |tee "Documentation/doc/sdk/node/${RELEASENAMELOWERNAME}/guides/What_is_new.md"

                                    sed "s/ref:doc\\/sdk\\/node\\//ref:doc\\/sdk\\/node\\/${RELEASENAMELOWERNAME}\\//g" "index.yml"  |tee "Documentation/doc/sdk/node/${RELEASENAMELOWERNAME}/index.yml"
                                    sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/${RELEASENAMELOWERNAME}\\//g" "sitemap.xml"  |tee "Documentation/doc/sdk/node/${RELEASENAMELOWERNAME}/sitemap.xml"


                                    """

                                    // stash includes: 'Documentation/**', name: 'DocumentationFolder'
                                } catch (Exception e) {
                                    echo "Failure: ${currentBuild.result}: ${e}"
                                }
                            }

                            //stage('Generate documentation search index' + target.name) {
                            stage('Generate documentation search index') {
                                try {
                                    echo "Build Hub V2 search index : "
                                    // unstash 'DocumentationFolder'
                                    sh script: """
                                     # echo "folder where run the Build Hub V2 search index."
                                     # pwd
                                     # ls
                                    """
                                    // unstash "withBuildDir"

                                    echo "Installation of developers_searchindex HUB V2 search library."
                                    sh """
                                    sudo npm install npm -g
                                    #cd "Documentation"
                                    npm install developers_searchindex --registry https://nexus.openrainbow.io/repository/npm-dev --legacy-peer-deps
                                    #npm install developers_searchindex --registry https://nexus.openrainbow.io/repository/npm-dev --legacy-peer-deps
                                    npm list developers_searchindex
                                    """

                                    echo "build hub doc"
                                    sh script: """
                                    # cd "Documentation"
                                    npm exec -- developers_searchindex --docPath Documentation/doc/sdk/node/${RELEASENAMELOWERNAME}
                                    # sh "npx developers_searchindex --docPath build/doc/hub"
                                    # ls -la build/doc/hub
                                    #cd -
                                    """

                                    // generateHubV2DocumentationSearchIndex("Documentation/doc/sdk/node/${RELEASENAMELOWERNAME}", "DocumentationFolder")

                                    stash includes: 'Documentation/**', name: 'DocumentationFolder'

                                } catch (Exception e) {
                                    echo "Failure: ${currentBuild.result}: ${e}"
                                }
                            }
                       parallelTargets(targets) { target ->
                            stage('Build Debian package' + target.name) {
                                try {
                                    echo "Build debian the package : "
                                    checkout scm
                                    unstash 'DocumentationFolder'
                                    sh script: """
                                       cd Documentation/debian
                                       ls -l
                                        #find Documentation/
                                        #cd "${workspace}/Documentation"
                                        # apt-key adv --keyserver dl.google.com/linux/chrome/deb --recv-keys E88979FB9B30ACF2 2> /dev/null
                                        # apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 78BD65473CB3BD13 2> /dev/null
                                        sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys E88979FB9B30ACF2
                                        cd -
                                    """

                                    debianBuild(
                                        debianPath: 'Documentation',
                                        nextVersion: "${env.FINAL_VERSION}" ,
                                        language: 'other',
                                        debVersionName: target.debVersionName,
                                        artifactTarget: target.name,
                                        stashName: target.name
                                    )
                                } catch (Exception e) {
                                    echo "Failure: ${currentBuild.result}: ${e}"
                                }
                                finally {
                                    //    notifyBuild(currentBuild.result)
                                }
                            }

                            stage('Debian Publish' + target.name) {
                                try {
                                    echo "Publish Debian package : "
                                    echo debianPublish.getDebianArtifacts().join('\n')
                                    debianPublish(
                                        repository: target.debPublishRepository,
                                        package: '*.deb',
                                        artifactTarget: target.name,
                                        stashName: target.name
                                    )
                                } catch (Exception e) {
                                    echo "Failure: ${currentBuild.result}: ${e}"
                                }
                                finally {
                                    //    notifyBuild(currentBuild.result)
                                }
                            }
                        }
                    }
                }
            }
    }
    post {
        always {
            sh 'echo "---- GLOBAL Post THE END ----"'
            cleanWs(cleanWhenNotBuilt: false,
                           deleteDirs: true,
                           disableDeferredWipeout: true,
                           notFailBuild: true,
                           patterns: [[pattern: '.gitignore', type: 'INCLUDE'],
                                      [pattern: '.propsfile', type: 'EXCLUDE']])
        }
        success {
            sh 'echo "Build is OK" '
        }
        failure {
            sh 'echo "Issue during build of the pipeline" '
        }
   }  
}
