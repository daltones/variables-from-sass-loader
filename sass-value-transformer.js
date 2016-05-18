var sassTypes = require('node-sass').types;
var rgbhex = require('rgb-hex');


function SassValueTransformer(valuesOnly, unitless, hexColors) {
  this.valuesOnly = valuesOnly;
  this.unitless = unitless;
  this.hexColors = hexColors;
}

SassValueTransformer.prototype.transform = function (value) {
  var i, j;

  if (value instanceof sassTypes.Number) {
    if (!this.valuesOnly) {
      return {
        type: 'number',
        value: value.getValue(),
        unit: value.getUnit()
      };
    } else if (this.unitless) {
      return value.getValue();
    } else {
      return value.getValue() + value.getUnit();
    }
  }

  if (value instanceof sassTypes.String) {
    if (!this.valuesOnly) {
      return {
        type: 'string',
        value: value.getValue()
      };
    } else {
      return value.getValue();
    }
  }

  if (value instanceof sassTypes.Color) {
    var r = value.getR();
    var g = value.getG();
    var b = value.getB();
    var a = value.getA();

    if (!this.valuesOnly) {
      return {
        type: 'color',
        r: value.getR(),
        g: value.getG(),
        b: value.getB(),
        a: value.getA()
      };
    } else if (this.hexColors && a === 1) {
      return '#' + rgbhex(r, g, b);
    } else if (a === 1) {
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    } else {
      return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
    }
  }

  if (value instanceof sassTypes.Boolean) {
    if (!this.valuesOnly) {
      return {
        type: 'boolean',
        value: value.getValue()
      };
    } else {
      return value.getValue();
    }
  }

  if (value instanceof sassTypes.List) {
    var list = [];
    for (i = 0, j = value.getLength(); i < j; ++i) {
      list.push(this.transform(value.getValue(i)));
    }

    if (!this.valuesOnly) {
      return {
        type: 'list',
        values: list,
        comma: value.getSeparator()
      };
    } else {
      return list;
    }
  }

  if (value instanceof sassTypes.Map) {
    var map = {};
    for (i = 0, j = value.getLength(); i < j; ++i) {
      map[value.getKey(i)] = this.transform(value.getValue(i));
    }

    if (!this.valuesOnly) {
      return {
        type: 'map',
        values: map
      };
    } else {
      return map;
    }
  }

  if (value instanceof sassTypes.Null) {
    if (!this.valuesOnly) {
      return {
        type: 'null'
      };
    } else {
      return null;
    }
  }

  throw new Error('Unknown type of catched SASS variable');
};


module.exports = SassValueTransformer;
