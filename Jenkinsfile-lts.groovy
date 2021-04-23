// Jenkinsfile-lts file for the production of lts delivery version with the jenkins job : "CPaaS-SDK-Node-SDK-lts"

@Library('rainbow-shared-library') _
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
                  label "docker-slave-cpaas-stretch"
                  customWorkspace "/home/jenkins/workspace/SDK-Node-SDK-LTS_delivery"
        }        
    }
    options {
        timeout(time: 1, unit: 'HOURS') 
        disableConcurrentBuilds()
        //withCredentials() 
    }
    
    parameters {
        string(name: 'RAINBOWNODESDKVERSION', defaultValue: '2.0.0-lts.0', description: 'What is the version of the LTS SDK to build?')
        booleanParam(name: 'SENDEMAIL', defaultValue: false, description: 'Send email after of the lts SDK built?')
        booleanParam(name: 'SENDEMAILTOVBERDER', defaultValue: false, description: 'Send email after of the lts SDK built to vincent.berder@al-enterprise.com only ?')
        //booleanParam(name: 'LTSBETA', defaultValue: false, description: 'Should this LTS version be also an LTS BETA Version ?')
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
                 //        string(name: 'RAINBOWNODESDKVERSION', defaultValue: '1.87.0', description: 'What is the version of the LTS SDK to build?')
                 //        booleanParam(name: 'SENDEMAIL', defaultValue: false, description: 'Send email after of the LTS SDK built?')
                 //    }
                 //}  
                        
                 when {
                    allOf {
                        branch "LTSDelivery"; 
                        triggeredBy 'user'
                    }
                 }
                 steps {
                    echo "Parameters to build the Rainbow-Node-SDK : ${params.RAINBOWNODESDKVERSION} ! with send email : ${params.SENDEMAIL} "
                    sh 'echo "Service user is $MJAPIKEY_USR , password is $MJAPIKEY_PSW"'
                 }
            }
            stage('Checkout') {
                when {
                    allOf {
                        branch "LTSDelivery"; 
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

            stage('Build') {
                when {
                    allOf {
                        branch "LTSDelivery"; 
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
                    #echo "Build's  shell the Rainbow-Node-SDK : ${RAINBOWNODESDKVERSION} with send email : ${SENDEMAIL}"
                        
                    echo ---------- Set the GIT config to be able to upload to server :
                    git config --local credential.helper "!f() { echo username=\\$GITLABVBERDER_USR; echo password=\\$GITLABVBERDER_PSW; }; f"
                    git config --global user.email "vincent.berder@al-enterprise.com"
                    git config --global user.name "vincent.berder@al-enterprise.com"
                        
                    #echo "registry=http://10.10.13.10:4873/
                    #//10.10.13.10:4873/:_authToken=\"bqyuhm71xMxSA8+6hA3rdg==\"" >> ~/.npmrc
                        
                    echo ---------- Set the NPM config and install node stable version :
                    mkdir ${WORKSPACE}/.npm-packages
                    npm config set prefix "${WORKSPACE}/.npm-packages"
                    export PATH=${WORKSPACE}/.npm-packages/bin:${PATH}

                    more ~/.npmrc > ~/.npmrc.sav 
                    echo "# UPDATE FROM JENKINS JOBS." > ~/.npmrc
                    echo "registry=http://registry.npmjs.org/
                    //registry.npmjs.org/:_authToken=${NPMJSAUTH_PSW}" |tee ./.npmrc
                        
                    #sudo npm install npm -g
                    sudo npm install n -g
                    sudo n stable
                        
                    echo ---------- STEP install the library :
                    npm install
                        
                    echo ---------- STEP grunt : 
                    echo Sub Step 1 : To compil the sources
                    grunt 
                    echo Sub Step 2 : To pepare the sources + doc for package
                    grunt delivery 
                        
                    #echo ---------- STEP commit : 
                    git reset --hard origin/LTSDelivery
                    npm version "${RAINBOWNODESDKVERSION}" 
                        
                    echo ---------- STEP whoami :
                    npm whoami
                        
                    #npm view
                    npm token list
                        
                    echo ---------- STEP publish :
                    npm publish
                        
                    echo ---------- PUSH tags AND files :
                    git tag -a ${RAINBOWNODESDKVERSION} -m "${RAINBOWNODESDKVERSION} is a lts version."
                    git push  origin HEAD:${env.BRANCH_NAME}
                    git push --tags origin HEAD:${env.BRANCH_NAME}

                    echo ---------- send emails getDebianArtifacts parameters setted :
                    export MJ_APIKEY_PUBLIC="${MJAPIKEY_USR}" 
                    export MJ_APIKEY_PRIVATE="${MJAPIKEY_PSW}"
                    ${SENDEMAIL} && npm run-script sendmailPreProduction
                    ${SENDEMAIL} && node mailing/postChangeLogInChannel.js host=official login=${VBERDERRB_USR} password=${VBERDERRB_PSW} appID=${APP_USR} appSecret=${APP_PSW}
                    
                    # To send the mailing only to vincent.berder@al-enterprise.com . 
                    ${SENDEMAILTOVBERDER} && npm run-script sendmailProductionTest
                         
                    more ~/.npmrc.sav > ~/.npmrc
                """
                }                
            }
              
            stage('Build Documentation from Rainbow Node SDK') {
                when {
                    allOf {
                        branch "LTSDelivery"; 
                        triggeredBy 'user'
                    }
                }
                steps{
                    sh script: """
                        echo "Build Documentation from Makefile"
                        make alllts
                        echo "{ 
                         \"lts\": true,
                         \"ltsbeta\": false,
                         \"sts\": false
                        }" > ./doc/sdk/node/lts/version.json
                    """
                                  
                    //stash includes: 'doc/sdk/node/**/*.*, doc/sdk/node/index.yml, doc/sdk/node/sitemap.yml', name: 'docfiles'
                }
            }
              
            stage('Documentation Packaging') {
                when {
                    allOf {
                        branch "LTSDelivery"; 
                        triggeredBy 'user'
                    }
                }
                steps { 
                    script   {
                         // node('docker-slave-nodebackend-buster-12.x') {  
                        stage('Debian Build') {
                            try {                         
                                echo "Build debian pkg ${params.RAINBOWNODESDKVERSION} ${workspace}"
                                sh script: """
                               
                                echo "copy Docs and Debian config files to the folder Documentation ."

                                cd "${workspace}"
                                mkdir -p Documentation
                                cp -R doc debian Documentation/
                     
                                echo "update files with doc/sdk/node path which should be doc/sdk/node/lts into the folder Documentation ."
                                sed "s/otlite-sdk-node-doc/otlite-sdk-node-doc-lts/" debian/control |tee "${workspace}/Documentation/debian/control"      
                                # more Documentation/debian/control
                                sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/lts\\//g" "tutorials/RainbowNodeSDKNews.md"  |tee "Documentation/doc/sdk/node/lts/guides/RainbowNodeSDKNews.md"
                                # more Documentation/doc/sdk/node/lts/guides/RainbowNodeSDKNews.md
                                sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/lts\\//g" "tutorials/Answering_chat_message.md" |tee  "Documentation/doc/sdk/node/lts/guides/Answering_chat_message.md"
                                sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/lts\\//g" "tutorials/Connecting_to_Rainbow_S2S_Mode.md"  |tee "Documentation/doc/sdk/node/lts/guides/Connecting_to_Rainbow_S2S_Mode.md"
                                sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/lts\\//g" "tutorials/Connecting_to_Rainbow_XMPP_Mode.md"  |tee "Documentation/doc/sdk/node/lts/guides/Connecting_to_Rainbow_XMPP_Mode.md"
                                sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/lts\\//g" "tutorials/Development_Kit.md"  |tee "Documentation/doc/sdk/node/lts/guides/Development_Kit.md"
                                sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/lts\\//g" "tutorials/Getting_Started.md"  |tee "Documentation/doc/sdk/node/lts/guides/Getting_Started.md"
                                sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/lts\\//g" "tutorials/Legals.md"  |tee "Documentation/doc/sdk/node/lts/guides/Legals.md"
                                sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/lts\\//g" "tutorials/Managing_bubble.md"  |tee "Documentation/doc/sdk/node/lts/guides/Managing_bubble.md"
                                sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/lts\\//g" "tutorials/What_is_new.md"  |tee "Documentation/doc/sdk/node/lts/guides/What_is_new.md"                      
                                 
                                sed "s/ref:doc\\/sdk\\/node\\//ref:doc\\/sdk\\/node\\/lts\\//g" "index.yml"  |tee "Documentation/doc/sdk/node/lts/index.yml"                      
                                sed "s/\\/doc\\/sdk\\/node\\//\\/doc\\/sdk\\/node\\/lts\\//g" "sitemap.xml"  |tee "Documentation/doc/sdk/node/lts/sitemap.xml"                      
                                 
                                #find Documentation/
                                #cd "${workspace}/Documentation"
                                """
                                echo "Build debian the package : "
                                debianBuild(
                                    debianPath: 'Documentation',
                                    nextVersion: "${params.RAINBOWNODESDKVERSION}" ,
                                    language: 'other'
                                )
                            } catch (Exception e) {
                                echo "Failure: ${currentBuild.result}: ${e}"
                            }
                        }
                          
                        stage('Debian Publish') {
                            try {
                                echo "Publish Debian package : "
                                echo debianPublish.getDebianArtifacts().join('\n')
                                debianPublish(
                                    repository: 'nightly-non-free-buster',
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
