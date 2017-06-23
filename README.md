# Contact CRUD
## Description
Create basic CRUD operations for a contact in Sqlite

## Install
npm install

## Running
node index.js

** Note everything is set to run on localhost:3000. You can change host and port by setting environment variables SERVER_HOST and SERVER_PORT respectively

## Tests
npm test

npm run jshint

## Create a contact
POST: /v1/contact

Payload:
```javascript
{
  "name": String(100), //Required
  "company": String(100),
  "favorite": Boolean,
  "smallImageURL": String(100), //Must be a valid URL
  "largeImageURL": String(100), //Must be a valid URL
  "email": String(100), //Required. Must be a valid email address
  "website": String(100), //Must be a valid URL
  "birthdate": Number, //Must be a Integer > 0
  "phone": {
    "work": String(12), //Must be in the format xxx-xxx-xxxx
    "home": String(12), //Must be in the format xxx-xxx-xxxx
    "mobile": String(12) //Must be in the format xxx-xxx-xxxx
  },
  address: {
    "street": String(100),
    "city": String(100),
    "state": String(2), //State is assumed to be a 2 Letter US / CA State Abbreviation. I.e. '33333' Or 'A12-B34' Or 'A12 B34'
    "country": String(2), //'US' || 'CA',
    "zip": String(7), //Valid 5 digit US or 7 character CA postal code
    "latitude": Number, //Floating point number, up to 6 decimal places
    "longitude": Number //Floating point number, up to 6 decimal places
  }
}
```
### Response Success:
HTTP statusCode: 201

HTTP Headers: Location: <URI to Resource>

Payload: none


## Read an existing contact
GET: /v1/contact/{contact id} //Contact Id is an Integer

### Response Success:

HTTP statusCode: 200

HTTP headers: none

Payload:
```javascript
{
  "name": String(100), //Required
  "company": String(100),
  "favorite": Boolean,
  "smallImageURL": String(100), //Must be a valid URL
  "largeImageURL": String(100), //Must be a valid URL
  "email": String(100), //Required. Must be a valid email address
  "website": String(100), //Must be a valid URL
  "birthdate": Number, //Must be a Integer > 0
  "phone": {
    "work": String(12), //Must be in the format xxx-xxx-xxxx
    "home": String(12), //Must be in the format xxx-xxx-xxxx
    "mobile": String(12) //Must be in the format xxx-xxx-xxxx
  },
  address: {
    "street": String(100),
    "city": String(100),
    "state": String(2), //State is assumed to be a 2 Letter US / CA State Abbreviation. I.e. '33333' Or 'A12-B34' Or 'A12 B34'
    "country": String(2), //'US' || 'CA',
    "zip": String(7), //Valid 5 digit US or 7 character CA postal code
    "latitude": Number, //Floating point number, up to 6 decimal places
    "longitude": Number //Floating point number, up to 6 decimal places
  }
}
```

### Response Contact Id not found
HTTP Status Code: 404

HTTP Headers: none

Payload:
```javascript
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Not Found"
}
```

## Update an Existing Contact
PUT: /v1/contact/{contact id} //Contact Id is an Integer

NOTE This is method will replace the entire contact entity

Payload:
```javascript
{
  "name": String(100), //Required
  "company": String(100),
  "favorite": Boolean,
  "smallImageURL": String(100), //Must be a valid URL
  "largeImageURL": String(100), //Must be a valid URL
  "email": String(100), //Required. Must be a valid email address
  "website": String(100), //Must be a valid URL
  "birthdate": Number, //Must be a Integer > 0
  "phone": {
    "work": String(12), //Must be in the format xxx-xxx-xxxx
    "home": String(12), //Must be in the format xxx-xxx-xxxx
    "mobile": String(12) //Must be in the format xxx-xxx-xxxx
  },
  address: {
    "street": String(100),
    "city": String(100),
    "state": String(2), //State is assumed to be a 2 Letter US / CA State Abbreviation. I.e. '33333' Or 'A12-B34' Or 'A12 B34'
    "country": String(2), //'US' || 'CA',
    "zip": String(7), //Valid 5 digit US or 7 character CA postal code
    "latitude": Number, //Floating point number, up to 6 decimal places
    "longitude": Number //Floating point number, up to 6 decimal places
  }
}
```

### Response Success:
HTTP Status Code: 200

HTTP Headers: none

Payload:
```javascript
{
  "name": String(100), //Required
  "company": String(100),
  "favorite": Boolean,
  "smallImageURL": String(100), //Must be a valid URL
  "largeImageURL": String(100), //Must be a valid URL
  "email": String(100), //Required. Must be a valid email address
  "website": String(100), //Must be a valid URL
  "birthdate": Number, //Must be a Integer > 0
  "phone": {
    "work": String(12), //Must be in the format xxx-xxx-xxxx
    "home": String(12), //Must be in the format xxx-xxx-xxxx
    "mobile": String(12) //Must be in the format xxx-xxx-xxxx
  },
  address: {
    "street": String(100),
    "city": String(100),
    "state": String(2), //State is assumed to be a 2 Letter US / CA State Abbreviation. I.e. '33333' Or 'A12-B34' Or 'A12 B34'
    "country": String(2), //'US' || 'CA',
    "zip": String(7), //Valid 5 digit US or 7 character CA postal code
    "latitude": Number, //Floating point number, up to 6 decimal places
    "longitude": Number //Floating point number, up to 6 decimal places
  }
}
```

### Response Contact Id not found
HTTP Status Code: 404

HTTP Headers: none

Payload:
```javascript
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Not Found"
}
```

## Delete a Contact
DELETE: /v1/contact/{contact id} //Contact Id is an Integer

### Response Success
HTTP Status Code: 204

HTTP Headers: none

Payload: none


### Response Contact Id not found
HTTP Status Code: 404

HTTP Headers: none

Payload:
```javascript
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Not Found"
}
```
