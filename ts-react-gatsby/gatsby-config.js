const path = require('path')

module.exports = {
  siteMetadata: {
    siteUrl: "https://www.yourdomain.tld",
    title: "seiyials-new-app",
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-root-import',
      options: {
        resolveModules: [path.join(__dirname, 'src')],
      },
    },
    "gatsby-plugin-sass",
    "gatsby-plugin-typescript",
    "gatsby-plugin-linaria", // must be AFTER typescript https://www.npmjs.com/package/gatsby-plugin-linaria
    "gatsby-plugin-image",
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-sitemap",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        icon: "src/images/icon.png",
      },
    },
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: "./src/images/",
      },
      __key: "images",
    },
  ],
};
