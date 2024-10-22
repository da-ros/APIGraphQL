const express = require('express')
const { graphqlHTTP } = require('express-graphql');
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLFloat, GraphQLID } = require('graphql')
const cors = require('cors')

const config = require('./config')
const database = require('./database')
database(config.DB_URL)

const ProductModel = require('./model')

const ProductType = new GraphQLObjectType({
    name: 'Product',
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        value: { type: GraphQLInt },
    }),
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        hello: {
            type: GraphQLString,
            resolve: () => 'Hello World!',
        },
        products: {
            type: new GraphQLList(ProductType),
            resolve:  async () => {
                try {
                    console.log('Resolviendo la consulta de productos');
                    const products = await ProductModel.find();
                    console.log('Productos encontrados:', products);
                    return products
                } catch (error) {
                    console.error('Error al obtener productos:', error);
                    throw new Error('Error fetching products');
                }
            },
        },
    },
});

const RootMutation = new GraphQLObjectType({
    name: 'RootMutationType',
    fields: {
        addProduct: {
        type: ProductType,
        args: {
            name: { type: new GraphQLNonNull(GraphQLString) },
            value: { type: new GraphQLNonNull(GraphQLInt) },
        },
        resolve: async (_, args) => {
            try {
                const product = new ProductModel(args);
                return await product.save();
            } catch (error) {
                console.error('Error al almacenar productos:', error);
                throw new Error('Error fetching products');
            }
        },
        },

        updateProduct: {
        type: ProductType,
        args: {
            id: { type: GraphQLString },
            name: { type: GraphQLString },
            value: { type: GraphQLFloat}
        },
        resolve: async (_, {id, name, value }) => {
            try {
                return await ProductModel.findByIdAndUpdate(
                    id,
                    { name, value },
                    { new: true }
                );
            } catch (error) {
                console.error('Error al modificar el producto:', error);
                throw new Error('Error modifying products');
            }
        }
        }
    }
});

const schema = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation,
});

const app = express();
app.use(cors());
app.use('/', express.static('public'))

app.use(
    '/graphql',
    graphqlHTTP({
      schema: schema,
      graphiql: true,
      onRequest: (req, res) => {
        console.log('Nueva solicitud GraphQL recibida.');
      },
      onError: (error) => {
        console.error('GraphQL Error: ', error);
      }
    })
  );

app.listen(config.PORT, (err) => {
    if (err) {
      console.error('Error al iniciar el servidor:', err);
    } else {
      console.log(`Server is running on http://localhost:${config.PORT}`);
    }});
