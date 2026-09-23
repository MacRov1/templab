const path = require(`path`)

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  const recordTemplate = path.resolve(`src/templates/record-detail.jsx`)

  const result = await graphql(`
    {
      allRecordsJson {
        nodes {
          id
          slug
          fecha
          temperatura
          internet
          bluetooth
          uptime
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild(`Error al ejecutar GraphQL query`, result.errors)
    return
  }

  const records = result.data.allRecordsJson.nodes

  records.forEach((record) => {
    createPage({
      path: `/registros/${record.slug}/`,
      component: recordTemplate,
      context: {
        slug: record.slug,
        record: record,
      },
    })
  })
}