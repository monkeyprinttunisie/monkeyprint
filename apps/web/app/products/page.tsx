import { listProducts } from "@/actions/productActions";

export default async function ProductsPage() {
  const products = await listProducts();

  return (
    <div>
      <h1>Products</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>{product.price.toString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
