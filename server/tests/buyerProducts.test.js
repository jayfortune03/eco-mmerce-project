const app = require('../app');
const { User, Product, UsersProduct, Category, Brand } = require('../models');
const request = require('supertest');
const { signToken } = require('../helpers/jwt');

const appJSON = 'application/json';
const formData = 'multipart/form-data';

const categoryCreator = {
  name: 'Skincare',
};

const firstName = 'firstName';
const lastName = 'lastName';
const phoneNumber = '123';
const password = 'password';

const sellerCreator = {
  firstName,
  lastName,
  email: 'seller@mail.com',
  phoneNumber,
  picture: 'picture',
  role: 'seller',
  password,
};
const buyerCreator = {
  firstName,
  lastName,
  email: 'buyer@mail.com',
  phoneNumber,
  picture: 'picture',
  role: 'buyer',
  password,
};

const ingredients = `${__dirname}/product.jpg`;
const image = `${__dirname}/cover.png`;

const name = 'name';
const price = 123;
const weight = 2.4;
const stock = 2;
const description = 'description';
const CategoryId = 1;
const brand = 'brandName';

const status = 0;
const ingridient = ['a', 'b'];
const harmfulIngridient = ['a', 'b'];
const picture = `${__dirname}/profile.jpg`;

let sellerId = 0;
let buyerId = 0;
let buyerToken = '';
const productData = {};

beforeAll(async () => {
  const category = await Category.create(categoryCreator);

  const seller = await User.create(sellerCreator);
  sellerId = seller.id;

  const buyer = await User.create(buyerCreator);
  buyerId = buyer.id;
  buyerToken = signToken({
    id: buyer.id,
    email: buyer.email,
    role: buyer.role,
  });

  const product = await Product.create(
    {
      name,
      price,
      stock,
      weight,
      status,
      description,
      ingridient,
      UserId: seller.id,
      picture,
      CategoryId: category.id,
      harmfulIngridient,
      Brands: { name: brand },
    },
    { include: [Brand] }
  );
  productData.id = product.id;

  await UsersProduct.create({
    ProductId: product.id,
    UserId: seller.id,
  });
});

afterAll(async () => {
  await Category.destroy({
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
  await User.destroy({
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
  await Product.destroy({
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
  await UsersProduct.destroy({
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
});

describe('GET /buyers/products [success]', () => {
  test('Should return [{id, name, price, stock, picture, harmfulIngridient, UsersProducts, Category, Brands}] [200]', (done) => {
    request(app)
      .get('/buyers/products')
      .set('Accept', appJSON)
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              name: expect.any(String),
              price: expect.any(Number),
              stock: expect.any(Number),
              picture: expect.any(String),
              harmfulIngridient: expect.arrayContaining([expect.any(String)]),
              UsersProducts: expect.arrayContaining([
                expect.objectContaining({
                  ProductId: expect.any(Number),
                  User: expect.objectContaining({
                    id: expect.any(Number),
                    firstName: expect.any(String),
                    lastName: expect.any(String),
                    role: expect.any(String),
                  }),
                }),
              ]),
              Category: expect.objectContaining({
                id: expect.any(Number),
                name: expect.any(String),
              }),
              Brands: expect.arrayContaining([
                expect.objectContaining({
                  id: expect.any(Number),
                  name: expect.any(String),
                }),
              ]),
            }),
          ])
        );
        done();
      })
      .catch((err) => done(err));
  });
});

describe('GET /buyers/products/:id [success]', () => {
  test('Should return {id, name, price, stock, weight, status, description, ingridient, picture, harmfulIngridient, UsersProducts, Category, Brands} [200]', (done) => {
    request(app)
      .get(`/buyers/products/${productData.id}`)
      .set('Accept', appJSON)
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: productData.id,
              name: expect.any(String),
              price: expect.any(Number),
              stock: expect.any(Number),
              weight: expect.any(Number),
              status: expect.any(String),
              description: expect.any(String),
              ingridient: expect.arrayContaining([expect.any(String)]),
              picture: expect.any(String),
              harmfulIngridient: expect.arrayContaining([expect.any(String)]),
              UsersProducts: expect.arrayContaining([
                expect.objectContaining({
                  ProductId: expect.any(Number),
                  User: expect.objectContaining({
                    id: expect.any(Number),
                    firstName: expect.any(String),
                    lastName: expect.any(String),
                    role: expect.any(String),
                  }),
                }),
              ]),
              Category: expect.objectContaining({
                id: expect.any(Number),
                name: expect.any(String),
              }),
              Brands: expect.arrayContaining([
                expect.objectContaining({
                  id: expect.any(Number),
                  name: expect.any(String),
                }),
              ]),
            }),
          ])
        );
        done();
      })
      .catch((err) => done(err));
  });
});

describe('GET /buyers/products/:id [failed]', () => {
  test('Should return {message: Product with ID ${id} is not found!} [404]', (done) => {
    request(app)
      .get(`/buyers/products/${notFoundProductId}`)
      .set('access_token', buyerToken)
      .then((response) => {
        expect(response.status).toBe(404);
        expect(response.body).toEqual(
          expect.objectContaining({
            message: `Product with ID ${notFoundProductId} is not found!`,
          })
        );
      });
  });
});

describe('POST /buyers/carts [success]', () => {
  test('Should return {message: Successfully added product to cart!} [201]', (done) => {
    request(app)
      .post('/buyers/carts')
      .set('access_token', buyerToken)
      .send({
        UserId: buyerId,
        ProductId: productData.id,
      })
      .then((response) => {
        expect(reponse.status).toBe(201);
        expect(response.body).toEqual(
          expect.objectContaining({
            message: 'Successfully added product to cart!',
          })
        );
        done();
      })
      .catch((err) => done(err));
  });
});

describe('POST /buyers/carts [failed]', () => {
  test('Should return {message: You are not authorized!} [401]', (done) => {
    request(app)
      .post('/buyers/carts')
      .set('Accept', appJSON)
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toEqual(
          expect.objectContaining({
            message: 'You are not authorized!',
          })
        );
        done();
      })
      .catch((err) => done(err));
  });
});

describe('GET /buyers/carts [success]', () => {
  test('Should return [{Product}] [200]', (done) => {
    request(app)
      .get('/buyers/carts')
      .set('access_token', buyerToken)
      .set('Accept', appJSON)
      .then((response) => {
        expect(reponse.status).toBe(200);
        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              Product: expect.objectContaining({
                id: expect.any(Number),
                name: expect.any(String),
                stock: expect.any(Number),
                price: expect.any(Number),
                weight: expect.any(Number),
                status: expect.any(String),
                picture: expect.any(String),
                UsersProducts: expect.objectContaining({
                  UserId: expect.any(Number),
                  ProductId: expect.any(Number),
                  User: expect.objectContaining({
                    id: expect.any(Number),
                    firstName: expect.any(String),
                    lastName: expect.any(String),
                  }),
                }),
                qty: expect.any(Number),
              }),
            }),
          ])
        );
        done();
      })
      .catch((err) => done(err));
  });
});

describe('GET /buyers/carts [failed]', () => {
  test('Should return {message: You are not authorized!} [401]', (done) => {
    request(app)
      .get('/buyers/carts')
      .set('Accept', appJSON)
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toEqual(
          expect.objectContaining({
            message: 'You are not authorized!',
          })
        );
        done();
      })
      .catch((err) => done(err));
  });
});

describe('DELETE /buyers/carts [success]', () => {
  test('Should return {message: Products has been removed from cart} [200]', (done) => {
    request(app)
      .delete('/buyers/carts')
      .set('access_token', buyerToken)
      .set('Accept', appJSON)
      .send({ ProductId: productData.id })
      .then((response) => {
        expect(reponse.status).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            message: 'Products has been removed from cart',
          })
        );
        done();
      })
      .catch((err) => done(err));
  });
});

describe('DELETE /buyers/carts [failed]', () => {
  test('Should return {message: You are not authorized!} [401]', (done) => {
    request(app)
      .delete('/buyers/carts')
      .set('Accept', appJSON)
      .send({ ProductId: productData.id })
      .then((response) => {
        expect(reponse.status).toBe(401);
        expect(response.body).toEqual(
          expect.objectContaining({
            message: 'You are not authorized!',
          })
        );
        done();
      })
      .catch((err) => done(err));
  });

  test('Should return {message: Product with ID ${id} is not found!} [200]', (done) => {
    request(app)
      .delete('/buyers/carts')
      .set('access_token', buyerToken)
      .set('Accept', appJSON)
      .send({ ProductId: productData.id })
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            message: 'Product with ID ${id} is not found!',
          })
        );
        done();
      })
      .catch((err) => done(err));
  });
});

describe('GET /buyers/history [success]', () => {
  test('Should return {} [200]', (done) => {
    request(app)
      .get('/buyers/history')
      .set('access_token', buyerToken)
      .set('Accept', appJSON)
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toEqual(expect.arrayContaining([]));
        done();
      })
      .catch((err) => done(err));
  });
});
