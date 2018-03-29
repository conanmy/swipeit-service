const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')

const resolvers = {
  Query: {
    users(parent, args, ctx, info) {
      return ctx.db.query.users({}, info)
    },
    user(parent, { userId }, ctx, info) {
      return ctx.db.query.user({
        where:{ id: userId }
      }, info)
    }
  },
  Mutation: {
    createUser(parent, { name, friends }, ctx, info) {
      friends = friends.map(friendId =>({ id: friendId }))
      return ctx.db.mutation.createUser(
        {
          data: {
            name,
            friends: {
              connect: friends
            }
          },
        },
        info,
      )
    },
    createWeeklyScore(parent, { userId, score }, ctx, info) {
      let definedUtcDateStart = new Date(Date.UTC(2018, 2, 19, 0, 0, 0))
      let now = new Date();
      let weekId = Math.floor(( now.getTime() - (definedUtcDateStart.getTime() - 12 * 60 * 60 * 1000) ) / (7 * 24 * 60 * 60 * 1000))
      return ctx.db.mutation.createWeeklyScore(
        {
          data: {
            week: weekId,
            score: score,
            user: {
              connect: {
                id: userId
              }
            }
          },
        },
        info,
      )
    }
  },
}

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    db: new Prisma({
      typeDefs: 'src/generated/prisma.graphql',
      endpoint: 'https://eu1.prisma.sh/public-checkermoth-817/swipeit/dev', // the endpoint of the Prisma DB service
      secret: 'mysecret123', // specified in database/prisma.yml
      debug: true, // log all GraphQL queryies & mutations
    }),
  }),
})

server.start(() => console.log('Server is running on http://localhost:4000'))
