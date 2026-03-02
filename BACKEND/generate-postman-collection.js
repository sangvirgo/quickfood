// Save as: generate-postman-collection.js
const fs = require('fs');

const collection = {
  info: { name: "QuickFood API", schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json" },
  variable: [
    { key: "baseUrl", value: "http://localhost:8080" },
    { key: "customerToken", value: "" },
    { key: "staffToken", value: "" },
    { key: "shipperToken", value: "" }
  ],
  item: [
    {
      name: "Auth",
      item: [
        {
          name: "Register Customer",
          request: {
            method: "POST",
            url: "{{baseUrl}}/api/core/auth/register",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                name: "Customer Test",
                email: "customer@test.com",
                password: "pass123",
                role: "CUSTOMER"
              }, null, 2)
            }
          }
        },
        {
          name: "Login Customer",
          request: {
            method: "POST",
            url: "{{baseUrl}}/api/core/auth/login",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({ email: "customer@test.com", password: "pass123" }, null, 2)
            }
          },
          event: [{
            listen: "test",
            script: {
              exec: [
                "pm.test('Login successful', function() {",
                "  pm.response.to.have.status(200);",
                "  var json = pm.response.json();",
                "  pm.collectionVariables.set('customerToken', json.token);",
                "});"
              ]
            }
          }]
        }
      ]
    },
    {
      name: "Products",
      item: [
        {
          name: "Get All Products",
          request: { method: "GET", url: "{{baseUrl}}/api/core/products" }
        },
        {
          name: "Create Product (Staff)",
          request: {
            method: "POST",
            url: "{{baseUrl}}/api/core/products",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{staffToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                name: "Test Burger",
                price: 9.99,
                stock: 100,
                imageUrl: "https://example.com/burger.jpg"
              }, null, 2)
            }
          }
        }
      ]
    },
    {
      name: "Orders",
      item: [
        {
          name: "Create Order",
          request: {
            method: "POST",
            url: "{{baseUrl}}/api/core/orders",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{customerToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                items: [{ productId: 1, quantity: 2 }],
                deliveryAddress: "123 Main St, HCMC"
              }, null, 2)
            }
          }
        },
        {
          name: "Get My Orders",
          request: {
            method: "GET",
            url: "{{baseUrl}}/api/core/orders",
            header: [{ key: "Authorization", value: "Bearer {{customerToken}}" }]
          }
        }
      ]
    }
  ]
};

fs.writeFileSync('QuickFood-API.postman_collection.json', JSON.stringify(collection, null, 2));
console.log('✅ Generated: QuickFood-API.postman_collection.json');
