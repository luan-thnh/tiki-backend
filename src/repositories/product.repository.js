const executeQuery = require('../utils/executeQuery.util');

module.exports = ProductRepository = {
  findAllProduct: async ({ productName, categoryName, sortByName, sortByDate, limit, offset }) => {
    let query = `
    SELECT * FROM products
    LEFT JOIN categories ON products.category_id = categories.category_id
    WHERE 1=1
  `;

    console.log({ sortByName, sortByDate });

    if (productName) {
      query += ` AND product_name like N'${productName}%'`;
    }
    if (categoryName) {
      query += ` AND category_name like N'${categoryName}%'`;
    }

    if (sortByName === 'asc') {
      query += ' ORDER BY product_name ASC';
    } else if (sortByName === 'desc') {
      query += ' ORDER BY product_name DESC';
    }

    if (sortByDate === 'newest') {
      query += ' , updated_at DESC';
    } else if (sortByDate === 'oldest') {
      query += ' , updated_at ASC';
    }

    console.log({ query });

    query += `
    LIMIT ${limit} OFFSET ${offset}
  `;

    const products = await executeQuery(query);

    const newProductsPromises = products.map(async (product) => {
      const images = await executeQuery(
        `SELECT image_url FROM product_images WHERE product_id = '${product.product_id}'`
      );
      const breadcrumbs = await executeQuery(
        `SELECT url, name, category_id FROM product_breadcrumbs WHERE product_id = '${product.product_id}'`
      );
      const specifications = await executeQuery(
        `SELECT id, name FROM product_specifications WHERE product_id = '${product.product_id}'`
      );
      const attributes = await Promise.all(
        specifications.map(
          async (specification) =>
            await executeQuery(
              `SELECT code, name, value FROM product_attributes WHERE specification_id = ${specification.id}`
            )
        )
      );

      specifications.attributes = attributes;

      product.images = images;
      product.breadcrumbs = breadcrumbs;
      product.specifications = specifications;

      return product;
    });

    // const newProducts = products.map((product) => {
    //   // Add image_list to product
    //   product.image_list = product_images
    //     .filter((image) => product.product_id === image.product_id)
    //     .map((image) => image.image_url);

    //   // Add breadcrumbs to product
    //   product.breadcrumbs = product_breadcrumbs
    //     .filter((breadcrumb) => product.product_id === breadcrumb.product_id)
    //     .map(({ url, name, category_id }) => ({ url, name, category_id }));

    //   // Add specifications to product
    //   product.specifications = product_specifications
    //     .filter((spec) => product.product_id === spec.product_id)
    //     .map(({ id, name }) => {
    //       const attributes = product_attributes
    //         .filter((attr) => attr.specification_id === id)
    //         .map(({ specification_id, ...attribute }) => ({ attribute }));

    //       return { name, attributes };
    //     });

    //   return product;
    // });

    return await Promise.all(newProductsPromises);
  },
  // GET: Get Product by ID
  findProductById: async (productId) => {
    let query = `  
                  SELECT * FROM products
                  LEFT JOIN categories ON products.category_id = categories.category_id
                  WHERE 1=1 AND product_id = '${productId}'`;
    const products = await executeQuery(query);
    const product = products[0];

    const images = await executeQuery(
      `SELECT image_url FROM product_images WHERE product_id = '${product.product_id}'`
    );
    const breadcrumbs = await executeQuery(
      `SELECT url, name, category_id FROM product_breadcrumbs WHERE product_id = '${product.product_id}'`
    );
    const specifications = await executeQuery(
      `SELECT id, name FROM product_specifications WHERE product_id = '${product.product_id}'`
    );
    const attributes = await Promise.all(
      specifications.map(
        async (specification) =>
          await executeQuery(
            `SELECT code, name, value FROM product_attributes WHERE specification_id = ${specification.id}`
          )
      )
    );

    specifications.attributes = attributes;

    product.image_list = images;
    product.breadcrumbs = breadcrumbs;
    product.specifications = specifications;

    return product;
  },
  // GET: Get Product by ID
  findProductByOne: async (attributes, operator = 'AND') => {
    let query = 'SELECT * FROM products WHERE ';
    const conditions = Object.keys(attributes).map(
      (key, index) =>
        `${key} = '${attributes[key]}'${
          index < Object.keys(attributes).length - 1 ? ` ${operator.toUpperCase()} ` : ''
        }`
    );
    query += conditions.join('');
    const res = await executeQuery(query);
    return res[0];
  },
  // POST: Create New Product
  createOneProduct: async (product) => {
    // const hasCategory = await executeQuery(`SELECT * FROM categories WHERE category_id = ${product.categoryId}`);

    // if (!hasCategory[0]) {
    //   const categoryQuery = `
    //       INSERT INTO categories (category_id, category_name)
    //       VALUES (${product.categoryId}, '${product.categoryName}')
    //     `;

    //   await executeQuery(categoryQuery);
    // }

    // Insert product
    const productQuery = `INSERT INTO products (
                      product_id,
                      product_name,
                      url_path,
                      price_new,
                      price_odd,
                      discount_product,
                      delivery_day,
                      delivery_price,
                      rating,
                      review_count,
                      favorite_count,
                      thumbnail_url,
                      limit_product,
                      sold_product,
                      description,
                      category_id,
                      shop_name
                    )
                  VALUES
                    (
                      '${product.productId}',
                      '${product.productName}',
                      '${product.urlPath}',
                      '${product.priceNew}',
                      '${product.priceOdd}',
                      '${product.discountProduct}',
                      '${product.deliveryDay}',
                      '${product.deliveryPrice}',
                      '${product.rating}',
                      '${product.reviewCount}',
                      '${product.favoriteCount}',
                      '${product.thumbnailUrl}',
                      '${product.limitProduct}',
                      '${product.soldProduct}',
                      '${product.description}',
                      '${product.categoryId}',
                      '${product.shopName}'
                    )`;

    await executeQuery(productQuery);

    // Insert image
    product?.imageList.forEach(async (url = '') => {
      const imageQuery = `INSERT INTO product_images (product_id, image_url)
                          VALUES ('${product.productId}', '${url}')`;

      await executeQuery(imageQuery);
    });

    // Insert breadcrumbs
    product?.breadcrumbs.forEach(async ({ url = '', name = '' }) => {
      const breadcrumbQuery = ` INSERT INTO product_breadcrumbs (url, name, product_id, category_id)
                                VALUES ('${url}', '${name}', '${product.productId}', '${product.categoryId}')`;

      await executeQuery(breadcrumbQuery);
    });

    // Insert specifications
    product?.specifications.forEach(async ({ name = '' }) => {
      const specificationQuery = `INSERT INTO product_specifications (product_id, name)
                                  VALUES ('${product.product_id}', '${name}')`;

      await executeQuery(specificationQuery);
    });

    return product;
  },
  // POST: Create New Product
  createAllProduct: async (products) => {
    try {
      await Promise.all(
        products.map(async (product) => {
          const productQuery = `INSERT INTO products (
          product_id,
          product_name,
          url_path,
          price_new,
          price_odd,
          discount_product,
          delivery_day,
          delivery_price,
          rating,
          review_count,
          favorite_count,
          thumbnail_url,
          limit_product,
          sold_product,
          description,
          category_id,
          shop_name
        ) VALUES (
          '${product.productId}', 
          '${product.productName}', 
          '${product.urlPath}', 
          '${product.priceNew}', 
          '${product.priceOdd}', 
          '${product.discountProduct}', 
          '${product.deliveryDay}', 
          '${product.deliveryPrice}', 
          '${product.rating}', 
          '${product.reviewCount}', 
          '${product.favoriteCount}', 
          '${product.thumbnailUrl}', 
          '${product.limitProduct}', 
          '${product.soldProduct}', 
          '${product.description}', 
          '${product.categoryId}', 
          '${product.shopName}')`;

          await executeQuery(productQuery);

          // Insert images
          await Promise.all(
            (product.imageList || []).map(async (url) => {
              const imageQuery = `INSERT INTO product_images (product_id, image_url) VALUES ('${product.productId}', '${url}')`;
              await executeQuery(imageQuery);
            })
          );

          // Insert breadcrumbs
          await Promise.all(
            (product.breadcrumbs || []).map(async ({ url = '', name = '' }) => {
              const breadcrumbQuery = `INSERT INTO product_breadcrumbs (url, name, product_id, category_id) VALUES ('${url}', '${name}', '${product.productId}', '${product.categoryId}')`;
              await executeQuery(breadcrumbQuery);
            })
          );

          // Insert specifications
          await Promise.all(
            (product.specifications || []).map(async ({ name = '' }) => {
              const specificationQuery = `INSERT INTO product_specifications (product_id, name) VALUES ('${product.productId}', '${name}')`;
              await executeQuery(specificationQuery);
            })
          );
        })
      );

      return products;
    } catch (error) {
      console.error('Error in createAllProduct:', error);
      throw error;
    }
  },

  // PUT: Update Product By ID
  findUpdateProductById: async (product) => {
    const query = `UPDATE products  
                     SET 
                        product_name = '${product.productName}', 
                        limit_product = '${product.limitProduct}', 
                        sold_product = '${product.soldProduct}', 
                        description = '${product.description}', 
                        image_list = '${product.imageList}', 
                        rating = '${product.rating}', 
                        review_count = '${product.reviewCount}', 
                        favorite_count = '${product.favoriteCount}', 
                     WHERE product_id = '${product.productId}'`;
    await executeQuery(query);
    return product;
  },

  // DELETE: Remove Product by ID
  findRemoveProductById: async (productId) => {
    const query = `DELETE FROM products WHERE product_id = '${productId}'`;
    await executeQuery(query);
  },
  testProduct: async ({ productName, categoryName, limit, offset }) => {
    let query = `
    SELECT * FROM products
    LEFT JOIN categories ON products.category_id = categories.category_id
    WHERE 1=1
  `;

    if (productName) {
      query += ` AND product_name = '${productName}'`;
    }
    if (categoryName) {
      query += ` AND category_name = '${categoryName}'`;
    }

    query += `
    LIMIT ${limit} OFFSET ${offset}
  `;

    const products = await executeQuery('SELECT * FROM products');
    const product_images = await executeQuery('SELECT * FROM product_images');
    const product_breadcrumbs = await executeQuery('SELECT * FROM product_breadcrumbs');
    const product_specifications = await executeQuery('SELECT * FROM product_specifications');
    const product_attributes = await executeQuery('SELECT * FROM product_attributes');
    const categories = await executeQuery('SELECT * FROM categories');

    const newProducts = products.map((product) => {
      // Add category_name to product
      const category = categories.find((cat) => product.category_id === cat.category_id);
      if (category) {
        product.category_name = category.category_name;
      }

      // Add image_list to product
      product.image_list = product_images
        .filter((image) => product.product_id === image.product_id)
        .map((image) => image.image_url);

      // Add breadcrumbs to product
      product.breadcrumbs = product_breadcrumbs
        .filter((breadcrumb) => product.product_id === breadcrumb.product_id)
        .map(({ url, name, category_id }) => ({ url, name, category_id }));

      // Add specifications to product
      product.specifications = product_specifications
        .filter((spec) => product.product_id === spec.product_id)
        .map(({ id, name }) => {
          const attributes = product_attributes
            .filter((attr) => attr.specification_id === id)
            .map(({ specification_id, ...attribute }) => ({ attribute }));

          return { name, attributes };
        });

      return product;
    });

    return newProducts;
  },
};
