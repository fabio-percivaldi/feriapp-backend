# Configuration
To configure serverless cli run se command ` serverless config credentials -o --provider aws --key ACCESS_KEY --secret SECRET_KEY`


# Deploy
to deploy the lambdas run ` set -a  && source .env && sls deploy `

# Credential 
Credential file is stored in ` ~/.aws/credentials `
There you can edit the ACCESS_KEY and SECRET_KEY per profile

# Bridges
To call the API you should provide a input body that follow this format:
``` { dayOfHolidays: 1,
    customHolidays: [
      {
        'city': 'Agrigento',
        'name': 'San Gerlando',
        'date': '2020-02-27',
        'region': 'Sicilia',
        'province': 'AG',
      }],
    country: 'DE',
    state: 'BE',
    region: null,
    city: '',
    daysOff: [0, 6] }

```

# Run functions locally

## Install Serverless
Run ` npm i -g serverless ` 
configure it ` serverless config credentials -o --provider aws --key ACCESS_KEY --secret SECRET_KEY`

## Configure your env file 
Copy the default.env file and compile it with the correct value (you can take the values from "lambda" service in AWS console)

## EC2 Bastion Host
Ensure that the EC2 Bastion Host is up and running and your IP is registered in Security Group Inbound Rule:
Type: SSH
Protocol: TCP
Port range: 22
Source: <your-pubblic-ip>

## Setup the ssh tunnel for db connection
Before starting you must have the ` public-bastion-ec2.pem ` file in your workind directory
Run the command ` sudo ssh -i public-bastion-ec2.pem -N -L 3306:feriapp-dev.ct1vsa2rhel6.eu-west-1.rds.amazonaws.com:3306 ec2-user@<pubblic-ipv4-ec2-address> `
                  
