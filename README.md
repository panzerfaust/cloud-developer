# Udagram - Instagram clone running on microservices
Course 3 of the Udacity Cloud Developer Nanodegree


## Project Description

This project involved taking the monolithic version of the Udagram project (course 2) and breaking it up into the:

* Reverseproxy - port forwarding of the different components
* Frontend - an ionic client that allows for the graphical interaction of the website
* Backend user - handles the management of users 
* Backend feed - handles the management of the feeds images
* Postgresql database running on AWS RDS
* Bucket store using AWS S3

These microservices where first containerised and deployed locally using docker-compose. Once this was working they were deployed to a kubernetes cluster on a public cloud platform. CI/CD was then added to the system.


# System Setup 

The system consists of a kubernetes cluster running on Microsoft Azure which connects to AWS for a database and bucket while having CI/CD done by Azure Pipeline.

## Postgresql

This database is setup and running on AWS RDS. The security group needs to be appended for the inbound traffic so that their can be a public connection.

## Bucket 

A bucket is setup on AWS S3 which allows a public connection.

## Containers 

The containers are builded and pushed manually or from a git push and Azure Pipeline. These containers are stored in Azure Container Registry (ACR).

However, these containers were originally using docker hub and being built and pushed locally using these commands:

sudo docker -t build andrewklazinga/reverseproxy .
sudo docker push andrewklazinga/reverseproxy

## Docker-compose

This was used to test locally by running multiple containers at the same time. It was run using:

docker-compose up

## secrets & configmap files

These files contain all the credentials that need to be kept secure
* aws-secret.yaml - login details for AWS encoded in base64
* env-secret.yaml - login details for postgresql in base64
* env-configmap.yaml - AWS_BUCKET, AWS_PROFILE, AWS_REGION, JWT_SECRET, POSTGRESS_DATABASE, POSTGRESS_HOST, URL

## Kubernetes setup 

Many platforms were considered for the kubernetes deployment. AWS was very expensive and the free tier did not support it. However, Google Cloud Platform and Microsft Azure gave a credit amount that was able to handle it. After using Terraform on both I realised how resource intensive it was by default and it was using up the credits fast. Therefore, I decided to choose Azure's Kubernetes service (AKS) to deploy the cluster cost effectively.

To learn how to deploy on AKS you can find the tutorial here:

https://docs.microsoft.com/en-us/azure/aks/


## Kubernetes deploy

Once the cluster is configured you need to deploy the pods. cd into the folder containing all of the deployment files and first deploy the secret and config files by using these commands:

```kubectl apply -f aws-secret.yaml
kubectl apply -f env-secret.yaml
kubectl apply -f env-configmap.yaml
```
These contain all of the environmental variables the system needs. This is useful as they aren't hardcoded into a file that could be accidentally put on git, and you can easily change them without having to individually update and redeploy all the containers. There was an issue with the postgresql secrets as they were encoded with base64 which caused an issue. To fix this I change their location to the env-configmap.

Next the pods need to be deployed with the reverseproxy last.

```kubectl apply -f frontend-deployment.yaml
kubectl apply -f backend-user-deployment.yaml
kubectl apply -f backend-feed-deployment.yaml
kubectl apply -f reverseproxy-deployment.yaml
```

These pods may not work until you deploy the services:

```kubectl apply -f frontend-service.yaml
kubectl apply -f backend-user-service.yaml
kubectl apply -f backend-feed-service.yaml
kubectl apply -f reverseproxy-service.yaml
```

All of the pods and their replicas should now be functioning correctly. In order to run the SERVICES in two different terminals:

kubectl port-forward service/reverseproxy 8080:8080
kubectl port-forward service/frontend 8100:8100

You will find it being published to http://localhost:8100 which can be used for debugging.

If you want the public to view it then you need to use the IP of the loadbalancer from:

kubectl get all


## Continuous Integration - Travis CI

In order to setup Travis CI you need to visit

https://www.travis-ci.com/

and sign in with your github credentials to link them together. Once that is done you need to create a .travis.yml file in your root directory with the correct settings and git push. From now whenever there is a git push it will automatically trigger Travis CI which will begin running tests according to the settings in the yaml file. This is viewable in the dashboard on the url.


## Continuous Integration & Continuous Deployment - Azure Pipeline

An advantage to using Azure is that they have Azure DevOps which is a platform designed to easily perform CI/CD across its cloud platform. It is integrated with Github and the only change that gets made is that docker hub is replaced with Azure Container Registry (ACR). THe service that will be used is Azure Pipeline which does the majority of the integration and setup for you.

This is path Azure Pipeline will create:

Github -> Build & Push Container -> Stores in Azure Container Registry (ACR) -> Deploys to Azure Kubernetes Service (AKS)

In order to set it up you just need to click the GUI and follow the prompts when asked such has which repository. It will scan the selected repository and give you the potential options. The one to choose is for Kubenetes which does the path mentioned above. Once selected choose your cluster, the default namespace and a name. This will lead to yaml files being created for Azure Pipeline and will be run when it detects a git push.

For more detailed documentation you can find it here:

https://docs.microsoft.com/en-us/azure/devops/pipelines/?view=azure-devops

Note: for rolling updates - This information is added to the deployment files in the k8s folder. If you are looking for canary deployment functionality that can now be added directly to the pipeline. More infornation can be found here:

https://devblogs.microsoft.com/devops/improved-continuous-delivery-capabilities-and-caching-for-azure-pipelines/