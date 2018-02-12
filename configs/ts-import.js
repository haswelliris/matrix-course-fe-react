const tsImportPluginFactory = require('ts-import-plugin');
const { getLoader } = require('react-app-rewired');

module.exports = function rewireTypescriptImport(config, env) {
  const tsLoader = getLoader(
    config.module.rules,
    rule =>
      rule.loader &&
      typeof rule.loader === 'string' &&
      rule.loader.includes('ts-loader')
  );

  tsLoader.options = {
    getCustomTransformers: () => ({
      before: [
        tsImportPluginFactory({
          libraryName: 'antd',
          libraryDirectory: 'es',
          style: true,
        })
      ]
    })
  };
  return config;
};
