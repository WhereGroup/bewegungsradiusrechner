module.exports = function (api) {
  api.cache(true);
  const presets = [
    [
      '@babel/preset-env',
      {
        corejs : {
          version : "3",
          proposals : true
        },
        useBuiltIns: 'usage',
        targets: {
          browsers: [
            "last 2 versions",
            "ie >= 11",
          ]
        }
      }
    ]
  ];
  const plugins= [
    ["@babel/plugin-proposal-decorators",{"decoratorsBeforeExport":true}],
    ["@babel/plugin-proposal-class-properties"],
    ["@babel/transform-runtime"]
  ];
  return {
    presets,
    plugins
  }
}
