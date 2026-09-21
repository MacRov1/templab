/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    title: `TempLab`,
    siteUrl: `https://templab.example.com`,
    description: `Monitor simple de un ESP32. Visualiza datos actuales y consulta registros históricos.`,
  },
  plugins: [
    "gatsby-plugin-postcss",
    "gatsby-plugin-image",
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
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "data",
        path: "./src/data/",
      },
      __key: "data",
    },
    {
      resolve: "gatsby-transformer-json",
      options: {
        typeName: ({ node }) => {
          if (node.absolutePath.includes("device")) return "DeviceJson"
          if (node.absolutePath.includes("records")) return "RecordsJson"
          return "DataJson"
        },
      },
    },
  ],
}