"use strict";

var AWS = require('aws-sdk');

const helloDBArn = process.env['HELLO_DB'];
const helloDBArnArr = helloDBArn.split('/');
const helloTableName = helloDBArnArr[helloDBArnArr.length - 1];

exports.handleHttpRequest = function(request, context, done) {
  try {
    const candidatoId = request.pathParameters.candidatoId;
    console.log(request);
    let response = {
      headers: {},
      body: '',
      statusCode: 200
    };

    switch (request.httpMethod) {
      case 'GET': {
        console.log('GET');
        let dynamo = new AWS.DynamoDB();
        var params = {
          TableName: helloTableName,
          Key: { 'candidato_id' : { S: candidatoId } },
          ProjectionExpression: 'nombre'
        };
        dynamo.getItem(params, function(err, data) {
          if (err) {
            console.log("Error", err);
            throw `Dynamo Get Error (${err})`
          } else {
            console.log("Success", data.Item.nombre);
            response.body = JSON.stringify(data.Item.nombre);
            done(null, response);
          }
        });
        break;
      }
      case 'POST': {
        console.log('POST');
        let bodyJSON = JSON.parse(request.body || '{}');
        let dynamo = new AWS.DynamoDB();
        let params = {
          TableName: helloTableName,
          Item: {
            'candidato_id': { S: candidatoId },
            'nombre': { S: bodyJSON['nombre'] }
          }
        };
        dynamo.putItem(params, function(error, data) {
          if (error) throw `Dynamo Error (${error})`;
          else done(null, response);
        })
        break;
      }
    }
  } catch (e) {
    done(e, null);
  }
}
