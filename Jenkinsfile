pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS_ID = 'docker-creds'  // Jenkins credentials ID for Docker Hub
        DOCKERHUB_USERNAME = 'vivek96254'           // Your Docker Hub username
        COMPOSE_FILE = 'docker-compose.yml'
        IMAGE_NAME_BACKEND = 'vivek96254/skillscan_docker-app'    // Docker Hub repository name for backend
        IMAGE_NAME_FRONTEND = 'vivek96254/skillscan_docker-frontend'  
    }

    triggers {
        githubPush()  // Trigger the pipeline on every GitHub push
    }

    stages {
        stage('Checkout') {
            steps {
                echo '🔄 Checking out code...'
                checkout scm
            }
        }

        stage('Docker Compose Build') {
            steps {
                echo '🔨 Building Docker images using Compose...'
                script {
                    if (isUnix()) {
                        sh "docker compose -f ${COMPOSE_FILE} build"
                    } else {
                        bat "docker compose -f ${COMPOSE_FILE} build"
                    }
                }
            }
        }

        stage('Tag Docker Images') {
            steps {
                echo '🏷️ Tagging images for Docker Hub...'
                script {
                    if (isUnix()) {
                        sh """
                            docker tag skillscan_docker-app:latest ${IMAGE_NAME_BACKEND}:latest
                            docker tag skillscan_docker-frontend:latest ${IMAGE_NAME_FRONTEND}:latest
                        """
                    } else {
                        bat """
                            docker tag skillscan_docker-app:latest ${IMAGE_NAME_BACKEND}:latest
                            docker tag skillscan_docker-frontend:latest ${IMAGE_NAME_FRONTEND}:latest
                        """
                    }
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                echo '📤 Pushing images to Docker Hub...'
                withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS_ID}", usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                    script {
                        if (isUnix()) {
                            sh '''
                                echo "$PASSWORD" | docker login -u "$USERNAME" --password-stdin
                                docker push vivek96254/skillscan_docker-app:latest
                                docker push vivek96254/skillscan_docker-frontend:latest
                            '''
                        } else {
                            bat '''
                                echo %PASSWORD% | docker login -u %USERNAME% --password-stdin
                                docker push vivek96254/skillscan_docker-app:latest
                                docker push vivek96254/skillscan_docker-frontend:latest
                            '''
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            echo '✅ Build and push succeeded!'
            emailext (
                subject: "✅ SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                    Hello Vivek,

                    The build completed successfully! 🎉

                    Job: ${env.JOB_NAME}
                    Build Number: ${env.BUILD_NUMBER}
                    Build URL: ${env.BUILD_URL}

                    Regards,
                    Jenkins
                    """,
                                    to: 'vivekvinay96254@gmail.com'
                                )
                            }
                            failure {
                                echo '❌ Build or push failed!'
                                emailext (
                                    subject: "❌ FAILURE: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                                    body: """
                    Hello Vivek,

                    The build or push failed. 😞

                    Job: ${env.JOB_NAME}
                    Build Number: ${env.BUILD_NUMBER}
                    Build URL: ${env.BUILD_URL}

                    Please check the console output for more details.

                    Regards,
                    Jenkins
                    """,
                to: 'vivekvinay96254@gmail.com'
            )
        }
    }
}
