var sass = require('node-sass');

module.exports = function (sassContent, variables) {
  var catchedVariables = Object.create(null);

  variables.forEach(function (variable) {
    sassContent += '\n@if variable-exists("' + variable + '") {\na {\na: send-to-variables-from-sass-loader("' + variable + '", $' + variable + ');\n}\n}';
  });

  sass.renderSync({
    data: sassContent,
    functions: {
      'send-to-variables-from-sass-loader($name, $value)': function (name, value) {
        catchedVariables[name.getValue()] = value;

        return sass.types.Null.NULL;
      }
    }
  });

  return catchedVariables;
};
