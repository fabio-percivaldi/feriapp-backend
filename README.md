# Configuration
To configure serverless cli run se command ` serverless config credentials -o --provider aws --key ACCESS_KEY --secret SECRET_KEY`


# Deploy
to deploy the lambdas run ` set -a  && source .env && sls deploy `

# Credential 
Credential file is stored in ` ~/.aws/credentials `
There you can edit the ACCESS_KEY and SECRET_KEY per profile

