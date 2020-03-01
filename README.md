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