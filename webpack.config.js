const WebpackPwaManifest = require("webpack-pwa-manifest");
const path = require("path");

const config = {
  // Update the entry point
  entry: "./public/index.js",
  output: {
    // Set the path and filename for the output bundle (hint: You will need to use "__dirname")
    path: __dirname + "/public/dist",
    filename: "bundle.js"
  },
  mode: "production",
  plugins: [new WebpackPwaManifest({
    filename: 'manifest.json',
    inject: false,
    fingerprints: false,
    name: 'Bugdet Tracker',
    short_name: 'Offline Budget Tracker App',
    description: 'Balance your accounts and track your expenses even when offline!',
    background_color: '#ffffff',
    start_url: '/',
    display: 'standalone',
    icons: [
      {
        src: path.resolve(__dirname, 'public/icons/icon-512x512.png'),
        sizes: [192, 512]
      }
    ]
  })]
};

module.exports = config;
