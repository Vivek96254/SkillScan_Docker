pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS_ID = 'docker-creds'  // Jenkins credentials ID for Docker Hub
        DOCKERHUB_USERNAME = 'vivek96254'  // Your Docker Hub username
        COMPOSE_FILE = 'docker-compose.yml'
        IMAGE_NAME_BACKEND = 'vivek96254/skillscan_docker-app'  // Docker Hub repository name for backend
        IMAGE_NAME_FRONTEND = 'vivek96254/skillscan_docker-frontend'  // Docker Hub repository name for frontend
    }

    triggers {
        githubPush()  // Trigger the pipeline on every GitHub push
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                checkout scm
            }
        }

        stage('Docker Compose Build') {
            steps {
                echo 'Building Docker images using Compose...'
                sh "docker compose -f ${COMPOSE_FILE} build"
            }
        }

        stage('Tag Docker Images') {
            steps {
                echo 'Tagging images for Docker Hub...'
                sh """
                    docker tag skillscan_docker-app:latest ${IMAGE_NAME_BACKEND}:latest
                    docker tag skillscan_docker-frontend:latest ${IMAGE_NAME_FRONTEND}:latest
                """
            }
        }

        stage('Push Docker Images') {
            steps {
                echo 'Pushing images to Docker Hub...'
                withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS_ID}", usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                    sh """
                        echo "$PASSWORD" | docker login -u "$USERNAME" --password-stdin
                        docker push ${IMAGE_NAME_BACKEND}:latest
                        docker push ${IMAGE_NAME_FRONTEND}:latest
                    """
                }
            }
        }
    }

    post {
        success {
            echo '✅ Build and push succeeded!'
        }
        failure {
            echo '❌ Build or push failed!'
        }
    }
}
