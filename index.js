var loaderUtils = require('loader-utils');
var catchSassVariables = require('./catch-sass-variables.js');
var SassValueTransformer = require('./sass-value-transformer.js');


function resolveBooleanQuery(name, resourceQuery, loaderQuery, defaultValue) {
  if (typeof resourceQuery[name] === 'boolean') {
    return resourceQuery[name];
  }
  if (resourceQuery[name] === 'true') {
    return true;
  }
  if (resourceQuery[name] === 'false') {
    return false;
  }
  if (typeof loaderQuery[name] === 'boolean') {
    return loaderQuery[name];
  }
  if (loaderQuery[name] === 'true') {
    return true;
  }
  if (loaderQuery[name] === 'false') {
    return false;
  }

  return defaultValue;
}

function createOutput(singleVariable, variables, catchedVariables) {
  if (singleVariable) {
    return 'module.exports = ' + JSON.stringify(catchedVariables[variables[0]]) + ';';
  }

  var entries = variables.map(function (variable) {
    return JSON.stringify(variable) + ':' + JSON.stringify(catchedVariables[variable]);
  });

  return 'module.exports = {' + entries.join(', ') + '};';
}


var variablesFromSassLoader = function (content) {
  var loaderQuery = loaderUtils.parseQuery(this.query);
  var resourceQuery = loaderUtils.parseQuery(this.resourceQuery);

  var singleVariable;
  var variables;

  if (typeof resourceQuery.variables === 'string') {
    singleVariable = false;
    variables = resourceQuery.variables.split(';');
  } else if (typeof resourceQuery.variable === 'string') {
    singleVariable = true;
    variables = [resourceQuery.variable];
  } else if (typeof loaderQuery.variables === 'string') {
    singleVariable = false;
    variables = loaderQuery.variables.split(';');
  } else if (typeof loaderQuery.variable === 'string') {
    singleVariable = true;
    variables = [loaderQuery.variable];
  }

  if (!variables) {
    throw new Error('Variable name not specified');
  }

  var valuesOnly = resolveBooleanQuery('valuesOnly', resourceQuery, loaderQuery, true);
  var unitless = resolveBooleanQuery('unitless', resourceQuery, loaderQuery, false);
  var hexColors = resolveBooleanQuery('hexColors', resourceQuery, loaderQuery, false);

  var catchedVariables = catchSassVariables(content, variables);

  var transformer = new SassValueTransformer(valuesOnly, unitless, hexColors);
  for (var variable in catchedVariables) {
    catchedVariables[variable] = transformer.transform(catchedVariables[variable]);
  }

  return createOutput(singleVariable, variables, catchedVariables);
};

variablesFromSassLoader.raw = true;


module.exports = variablesFromSassLoader;
