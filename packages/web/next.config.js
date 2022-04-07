/** @type {import('next').NextConfig} */

const path = require('path')
const withSass = require('@zeit/next-sass');
module.exports = withSass({
  cssModules: true
});

const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
};

module.exports = nextConfig
