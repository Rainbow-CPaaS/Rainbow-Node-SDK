// Jenkinsfile-sts file for the production of sts delivery version with the jenkins job : "CPaaS-SDK-Node-SDK-sts"

@Library('rainbow-shared-library@hubSearchIndex') _
import groovy.transform.Field

// Map with the default values
@Field
Map defaults = [
        build: 'nodesdk', // Which SDK documentation will be build
        nextVersion: '0.0.0', // Debian package version. It's a 3 digits numbers.
        stash: 'doc'
]

def DOC_PATH = ''

pipeline {
    agent {
        label {
                  label "docker-slave-cpaas-bullseye"
                  customWorkspace "/home/jenkins/workspace/SDK-Node-SDK-sts_delivery"
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
        string(name: 'RAINBOWNODESDKVERSION', defaultValue: '1.87.0-test.16', description: 'What is the version of the STS SDK to build?')
        booleanParam(name: 'SENDEMAIL', defaultValue: false, description: 'Send email after of the sts SDK built?')
        booleanParam(name: 'SENDEMAILTOVBERDER', defaultValue: false, description: 'Send email after of the lts SDK built to vincent.berder@al-enterprise.com only ?')
        booleanParam(name: 'DEBUGINTERNAL', defaultValue: true, description: 'Should this STS version be compiled with internal debug ?')
        booleanParam(name: 'LTSBETA', defaultValue: false, description: 'Should this STS version be also an LTS BETA Version ?')
        booleanParam(name: 'PUBLISHONNPMJSWITHSTSTAG', defaultValue: false, description: 'Publish this STS version to npmjs with the tag \"sts\" else with \".net\" tag ?')
        booleanParam(name: 'PUBLISHTONPMANDSETTAGINGIT', defaultValue: true, description: 'Publish the sts SDK built to npmjs and save the tag/branch to GIT.')
        //string(name: 'PERSON', defaultValue: 'Mr Jenkins', description: 'Who should I say hello to?')
        //text(name: 'BIOGRAPHY', defaultValue: '', description: 'Enter some information about the person')
        //booleanParam(name: 'TOGGLE', defaultValue: true, description: 'Toggle this value')
        //choice(name: 'CHOICE', choices: ['One', 'Two', 'Three'], description: 'Pick something')
        //password(name: 'PASSWORD', defaultValue: 'SECRET', description: 'Enter a password')
    }
     environment {
                MJAPIKEY = credentials('2f8c39d0-35d5-4b67-a68a-f60aaa7084ad') // 6f119214480245deed79c5a45c59bae6/****** (MailJet API Key to post emails)
                NPMJSAUTH = credentials('6ba55a5f-c0fa-41c3-b5dd-0c0f62ee22b5') // npmjs /****** (npmjs auth token to publish vberder)
                GITLABVBERDER = credentials('b04ca5f5-3666-431d-aaf4-c6c239121510') // gitlab credential of vincent berder.
                VBERDERRB = credentials('5bf46f68-1d87-4091-9aba-c337198503c8') // (vberder - OFFICIAL).
                APP = credentials('25181a6c-2586-477d-9b95-0a1cc456c831') // (Rainbow Official Vberder AppId).
    }
    stages {
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
                    allOf {
                        branch "STSDelivery"; 
                        triggeredBy 'user'
                    }
                 }
                 steps {
                    echo "Parameters to build the Rainbow-Node-SDK : ${params.RAINBOWNODESDKVERSION} ! with send email : ${params.SENDEMAIL} and is LTSBETA : ${params.LTSBETA}"
                    sh 'echo "Service user is $MJAPIKEY_USR , password is $MJAPIKEY_PSW"'
                 }
            }
            stage('Checkout') {
                when {
                    allOf {
                        branch "STSDelivery"; 
                        triggeredBy 'user'
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
                    allOf {
                        branch "STSDelivery"; 
                        //triggeredBy 'UpstreamCause'
                        //triggeredBy "[[_class:jenkins.branch.BranchIndexingCause, shortDescription:Branch indexing]]"
                        triggeredBy cause: 'BranchIndexingCause' , detail: "Branch indexing"// cause($class: 'jenkins.branch.BranchIndexingCause')
                        //triggeredBy cause : 'jenkins.branch.BranchIndexingCause' // cause($class: 'jenkins.branch.BranchIndexingCause')
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
                                    #sudo n stable

                                    ##npm install -g https://tls-test.npmjs.com/tls-test-1.0.0.tgz
                                    #npm install https://tls-test.npmjs.com/tls-test-1.0.0.tgz
                                                                                
                                    #more ~/.npmrc.sav > ~/.npmrc
                                """
                }
            }

            stage('Build') {
                when {
                    allOf {
                        branch "STSDelivery"; 
                        triggeredBy 'user'
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
                            
                    sh script: """
                    #echo "Build's  shell the Rainbow-Node-SDK : ${RAINBOWNODESDKVERSION} with send email : ${SENDEMAIL} and is LTSBETA : ${LTSBETA}"
                        
                    echo ---------- Set the GIT config to be able to upload to server :
                    git config --local credential.helper "!f() { echo username=\\$GITLABVBERDER_USR; echo password=\\$GITLABVBERDER_PSW; }; f"
                    git config --global user.email "vincent.berder@al-enterprise.com"
                    git config --global user.name "vincent.berder@al-enterprise.com"
                        
                    #echo ---------- Create a specific branch :
                    #git branch "delivered${RAINBOWNODESDKVERSION}" 
                    #git checkout "delivered${RAINBOWNODESDKVERSION}"
                    #git push  --set-upstream origin "delivered${RAINBOWNODESDKVERSION}"
                        
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
                    sudo n stable
                    
                    sudo npm install --global npm@6
                        
                    cd ${WORKSPACE}
                    
                    echo ---------- STEP install the library :
                    npm install
                    
                    ls 
                    ls ./src/**/*
                        
                    npm version "${RAINBOWNODESDKVERSION}"  --allow-same-version

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
                        grunt 
                        echo Sub Step 2 : To prepare the sources + doc for package
                        grunt delivery 
                    fi
                        
                        
                        
                    #echo ---------- STEP commit : 
                    git reset --hard origin/${env.BRANCH_NAME}
                    npm version "${RAINBOWNODESDKVERSION}"  --allow-same-version
                                                
                    echo ---------- STEP whoami :
                    npm whoami
                        
                    #npm view
                    npm token list
                        
                    cp -R build/JSONDOCS guide/JSONDOCS

                    echo ---------- STEP publish :
                    if [ "${PUBLISHTONPMANDSETTAGINGIT}" = "true" ]; then
                        if [ "${PUBLISHONNPMJSWITHSTSTAG}" = "true" ]; then
                            echo "Publish on npmjs with tag."
                            npm publish --tag sts
                        else
                            echo "Publish on npmjs with node .net tag."
                            npm publish --tag .net
                        fi
                    fi
                        
                    echo ---------- PUSH tags AND files :
                    ${PUBLISHTONPMANDSETTAGINGIT} && git tag -a ${RAINBOWNODESDKVERSION} -m "${RAINBOWNODESDKVERSION} is a sts version."
                    ${PUBLISHTONPMANDSETTAGINGIT} && git push  origin HEAD:${env.BRANCH_NAME}
                    ${PUBLISHTONPMANDSETTAGINGIT} && git push --tags origin HEAD:${env.BRANCH_NAME}

                    echo ---------- send emails getDebianArtifacts parameters setted :
                    export MJ_APIKEY_PUBLIC="${MJAPIKEY_USR}" 
                    export MJ_APIKEY_PRIVATE="${MJAPIKEY_PSW}"
                    ${SENDEMAIL} && npm run-script sendmailPreProduction
                    ${SENDEMAIL} && node mailing/postChangeLogInChannel.js host=official login=${VBERDERRB_USR} password=${VBERDERRB_PSW} appID=${APP_USR} appSecret=${APP_PSW}

                    # To send the mailing only to vincent.berder@al-enterprise.com . 
                    ${SENDEMAILTOVBERDER} && npm run-script sendmailProductionTest
                    ${SENDEMAILTOVBERDER} && node mailing/postChangeLogInChannel.js host=official login=${VBERDERRB_USR} password=${VBERDERRB_PSW} appID=${APP_USR} appSecret=${APP_PSW}  channelName=RNodeSdkChangeLog 
                        
                    more ~/.npmrc.sav > ~/.npmrc
                """
                }                
            }
              
            stage('Build Documentation from Rainbow Node SDK') {
                when {
                    allOf {
                        branch "STSDelivery"; 
                        triggeredBy 'user'
                    }
                }
                steps{
                    sh script: """
                        echo "Build Documentation from Makefile"
                        make allsts
                        echo "{ 
                         \\"lts\\": false,
                         \\"ltsbeta\\": ${LTSBETA},
                         \\"sts\\": true
                        }" > ./doc/sdk/node/sts/version.json
                    """
                                  
                    //stash includes: 'doc/sdk/node/**/*.*, doc/sdk/node/index.yml, doc/sdk/node/sitemap.yml', name: 'docfiles'
                }
            }
              
            stage('Documentation Packaging') {
                when {
                    allOf {
                        branch "STSDelivery"; 
                        triggeredBy 'user'
                    }
                }
                steps { 
                    script   {
                         // node('docker-slave-nodebackend-buster-12.x') {  
                        stage('Build Debian Folder') {
                            try {                         
                                echo "Build debian pkg ${params.RAINBOWNODESDKVERSION} ${workspace}"
                                sh script: """
                               
                                echo "copy Docs and Debian config files to the folder Documentation ."

                                cd "${workspace}"
                                echo find debian in workspace
                                find debian
                                
                                mkdir -p Documentation
                                cp -R doc debian Documentation/
                     
                                echo "update files with doc/sdk/node path which should be doc/sdk/node/sts into the folder Documentation ."
                                sed "s/otlite-sdk-node-doc/otlite-sdk-node-doc-sts/" debian/control |tee "${workspace}/Documentation/debian/control"      
                                sed "s/\\/usr\\/share\\/sdkdoc\\/node\\/sitemap.xml/\\/usr\\/share\\/sdkdoc\\/node\\/sts\\/sitemap.xml/" debian/postinst |tee "${workspace}/Documentation/debian/postinst"      
                                # more Documentation/debian/control
                                sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/sts\\//g" "guide/RainbowNodeSDKNews.md"  |tee "Documentation/doc/sdk/node/sts/guides/RainbowNodeSDKNews.md"
                                # more Documentation/doc/sdk/node/sts/guides/RainbowNodeSDKNews.md
                                sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/sts\\//g" "guide/Answering_chat_message.md" |tee  "Documentation/doc/sdk/node/sts/guides/Answering_chat_message.md"
                                sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/sts\\//g" "guide/Connecting_to_Rainbow_S2S_Mode.md"  |tee "Documentation/doc/sdk/node/sts/guides/Connecting_to_Rainbow_S2S_Mode.md"
                                sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/sts\\//g" "guide/Connecting_to_Rainbow_XMPP_Mode.md"  |tee "Documentation/doc/sdk/node/sts/guides/Connecting_to_Rainbow_XMPP_Mode.md"
                                sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/sts\\//g" "guide/Development_Kit.md"  |tee "Documentation/doc/sdk/node/sts/guides/Development_Kit.md"
                                sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/sts\\//g" "guide/Getting_Started.md"  |tee "Documentation/doc/sdk/node/sts/guides/Getting_Started.md"
                                sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/sts\\//g" "guide/Legals.md"  |tee "Documentation/doc/sdk/node/sts/guides/Legals.md"
                                sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/sts\\//g" "guide/Managing_bubbles.md"  |tee "Documentation/doc/sdk/node/sts/guides/Managing_bubbles.md"
                                sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/sts\\//g" "guide/Managing_conferences.md"  |tee "Documentation/doc/sdk/node/sts/guides/Managing_conferences.md"
                                sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/sts\\//g" "guide/Managing_RPCoverXMPP.md"  |tee "Documentation/doc/sdk/node/sts/guides/Managing_RPCoverXMPP.md"
                                sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/sts\\//g" "build/What_is_new_generated.md"  |tee "Documentation/doc/sdk/node/sts/guides/What_is_new.md"                      
                                 
                                sed "s/ref:doc\\/sdk\\/node\\//ref:doc\\/sdk\\/node\\/sts\\//g" "index.yml"  |tee "Documentation/doc/sdk/node/sts/index.yml"                      
                                sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/sts\\//g" "sitemap.xml"  |tee "Documentation/doc/sdk/node/sts/sitemap.xml"                      
                                

                                """

                                 stash includes: 'Documentation/**', name: 'DocumentationFolder'
                            } catch (Exception e) {
                                echo "Failure: ${currentBuild.result}: ${e}"
                            }
                        }

                        stage("Generate documentation search index") {
                            try {
                                echo "Build Hub V2 search index : "
                                   // unstash 'DocumentationFolder'
                                   sh script: """
                                 # echo "folder where run the Build Hub V2 search index."
                                 # pwd 
                                 # ls 
                                """
                                 generateHubV2DocumentationSearchIndex("Documentation/doc/sdk/node/sts", "DocumentationFolder")
                            } catch (Exception e) {
                                echo "Failure: ${currentBuild.result}: ${e}"
                            }
                        }

                        stage('Build Debian package') {
                            try {
                                echo "Build debian the package : "
                                sh script: """
                                    #find Documentation/
                                    #cd "${workspace}/Documentation"
                                    apt-key adv --keyserver https://dl.google.com/linux/chrome/deb --recv-keys E88979FB9B30ACF2
                                """
                                
                                debianBuild(
                                    debianPath: 'Documentation',
                                    nextVersion: "${params.RAINBOWNODESDKVERSION}" ,
                                    language: 'other'
                                )
                            } catch (Exception e) {
                                echo "Failure: ${currentBuild.result}: ${e}"
                            }
                            finally {
                                //    notifyBuild(currentBuild.result)
                            }
                        }
                          
                        stage('Debian Publish') {
                            try {
                                echo "Publish Debian package : "
                                echo debianPublish.getDebianArtifacts().join('\n')
                                debianPublish(
                                    repository: 'nightly-non-free-bullseye',
                                    stashName: "deb"
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
    post {
        always {
            sh 'echo "---- THE END ----"'
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
