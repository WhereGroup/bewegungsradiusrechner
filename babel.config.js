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
            "ie >= 10",
          ]
        }
      }
    ]
  ];
  const plugins= [
  ];
  return {
    presets,
    plugins
  }
}
