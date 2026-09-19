
import { useState } from "react";
import {
  Package,
  Search,
  RefreshCw,
  Edit3,
  Trash2,
  ArrowLeft,
  X,
  Save,
  Tag,
  IndianRupee,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./Products.css";

function Products() {

  // =========================================
  // PRODUCTS
  // =========================================

  const API_URL = import.meta.env.VITE_API_URL;

  const [products, setProducts] = useState([]);

  // Search product name
  const [search, setSearch] = useState("");

  // Loading
  const [loading, setLoading] = useState(false);

  // Error
  const [error, setError] = useState("");


  // =========================================
  // EDIT MODAL
  // =========================================

  const [showEditModal, setShowEditModal] = useState(false);

  const [editProduct, setEditProduct] = useState({
    product_id: "",
    product_name: "",
    product_price: "",
  });

  const [updateLoading, setUpdateLoading] = useState(false);


  // =========================================
  // FETCH ALL PRODUCTS
  // =========================================

  const fetchProducts = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/products`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();

      setProducts(data);

    } catch (err) {

      console.error(err);

      setError(err.message);

      setProducts([]);

    } finally {

      setLoading(false);

    }
  };


  // =========================================
  // SEARCH PRODUCT BY EXACT NAME
  // =========================================

  const searchProduct = async () => {

    const productName = search.trim();

    if (!productName) {

      setError("Please enter a product name");

      return;
    }

    try {

      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/products/search?name=${encodeURIComponent(
          productName
        )}`
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.error || "Product not found"
        );
      }

      // Backend returns one product
      setProducts([data]);

    } catch (err) {

      console.error(err);

      setProducts([]);

      setError(err.message);

    } finally {

      setLoading(false);

    }
  };


  // =========================================
  // CLEAR SEARCH
  // =========================================

  const clearSearch = () => {

    setSearch("");

    setProducts([]);

    setError("");

  };


  // =========================================
  // OPEN EDIT MODAL
  // =========================================

  const handleEdit = (product) => {

    setEditProduct({
      product_id: product.product_id,
      product_name: product.product_name,
      product_price: product.product_price,
    });

    setShowEditModal(true);

  };


  // =========================================
  // EDIT INPUT CHANGE
  // =========================================

  const handleEditChange = (e) => {

    const { name, value } = e.target;

    setEditProduct((prev) => ({
      ...prev,
      [name]: value,
    }));

  };


  // =========================================
  // UPDATE PRODUCT
  // =========================================

  const handleUpdate = async (e) => {

    e.preventDefault();

    try {

      setUpdateLoading(true);

      setError("");

      const response = await fetch(
        `${API_URL}/products/${editProduct.product_id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            product_name: editProduct.product_name,
            product_price: Number(
              editProduct.product_price
            ),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.error || "Failed to update product"
        );
      }


      // =========================================
      // UPDATE REACT STATE
      // =========================================

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.product_id ===
          editProduct.product_id
            ? data.product
            : product
        )
      );


      // Close modal
      setShowEditModal(false);

      setError("");

    } catch (err) {

      console.error(err);

      setError(err.message);

    } finally {

      setUpdateLoading(false);

    }
  };


  // =========================================
  // DELETE
  // =========================================

  const handleDelete = (id) => {

    alert(
      `Delete product #${id} - DELETE API next`
    );

  };


  // =========================================
  // JSX
  // =========================================

  return (

    <div className="students-page">


      {/* =====================================
          HEADER
      ===================================== */}

      <header className="students-header">

        <div className="students-title">

          <Link
            to="/"
            className="back-button"
          >
            <ArrowLeft size={19} />
          </Link>


          <div className="title-icon product-title-icon">

            <Package size={27} />

          </div>


          <div>

            <p className="page-label">
              DATABASE TABLE
            </p>

            <h1>
              Products
            </h1>

          </div>

        </div>


        <div className="record-count">

          {products.length} Records

        </div>

      </header>



      {/* =====================================
          CONTROLS
      ===================================== */}

      <section className="students-controls">


        {/* FETCH ALL */}

        <button
          className="fetch-button"
          onClick={fetchProducts}
          disabled={loading}
        >

          <RefreshCw
            size={18}
            className={
              loading
                ? "spinning"
                : ""
            }
          />

          {loading
            ? "Fetching..."
            : "Fetch Products"}

        </button>



        {/* SEARCH AREA */}

        <div className="search-area">


          {/* SEARCH INPUT */}

          <div className="search-box">

            <Tag size={18} />


            <input
              type="text"
              placeholder="Enter full product name..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              onKeyDown={(e) => {

                if (e.key === "Enter") {
                  searchProduct();
                }

              }}
            />


            {search && (

              <button
                className="clear-search"
                onClick={clearSearch}
                type="button"
              >

                <X size={16} />

              </button>

            )}

          </div>



          {/* SEARCH BUTTON */}

          <button
            className="search-button"
            onClick={searchProduct}
            disabled={loading}
          >

            <Search size={17} />

            {loading
              ? "Searching..."
              : "Search"}

          </button>

        </div>

      </section>



      {/* =====================================
          ERROR
      ===================================== */}

      {error && (

        <div className="error-message">

          {error}

        </div>

      )}



      {/* =====================================
          TABLE
      ===================================== */}

      <section className="students-table-container">


        {/* LOADING */}

        {loading ? (

          <div className="table-message">

            <RefreshCw
              className="spinning"
              size={30}
            />

            <p>
              Loading products...
            </p>

          </div>


        ) : products.length === 0 ? (


          /* =================================
             EMPTY
          ================================= */

          <div className="table-message">

            <Package size={45} />

            <h3>
              No products loaded
            </h3>

            <p>
              Click "Fetch Products" to load
              products from SQLite.
            </p>

          </div>


        ) : (


          /* =================================
             TABLE
          ================================= */

          <div className="table-scroll">

            <table>

              <thead>

                <tr>

                  <th>
                    Product ID
                  </th>

                  <th>
                    Product Name
                  </th>

                  <th>
                    Price
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {products.map((product) => (

                  <tr
                    key={product.product_id}
                  >


                    {/* PRODUCT ID */}

                    <td>

                      <span className="id-badge">

                        #{product.product_id}

                      </span>

                    </td>


                    {/* PRODUCT NAME */}

                    <td className="student-name">

                      {product.product_name}

                    </td>


                    {/* PRICE */}

                    <td>

                      <span className="price-badge">

                        ₹
                        {Number(
                          product.product_price
                        ).toFixed(2)}

                      </span>

                    </td>


                    {/* ACTIONS */}

                    <td>

                      <div className="action-buttons">


                        {/* EDIT */}

                        <button
                          className="edit-button"
                          title="Edit product"
                          onClick={() =>
                            handleEdit(product)
                          }
                        >

                          <Edit3 size={16} />

                        </button>


                        {/* DELETE */}

                        <button
                          className="delete-button"
                          title="Delete product"
                          onClick={() =>
                            handleDelete(
                              product.product_id
                            )
                          }
                        >

                          <Trash2 size={16} />

                        </button>


                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>



      {/* =====================================
          EDIT MODAL
      ===================================== */}

      {showEditModal && (

        <div className="modal-overlay">


          <div className="edit-modal">


            {/* MODAL HEADER */}

            <div className="modal-header">


              <div>

                <p className="modal-label">
                  PRODUCT RECORD
                </p>

                <h2>
                  Edit Product
                </h2>

              </div>


              <button
                className="close-modal"
                onClick={() =>
                  setShowEditModal(false)
                }
                type="button"
              >

                <X size={20} />

              </button>

            </div>



            {/* =================================
                FORM
            ================================= */}

            <form
              onSubmit={handleUpdate}
            >


              {/* PRODUCT NAME */}

              <div className="form-group">

                <label>
                  Product Name
                </label>

                <input
                  type="text"
                  name="product_name"
                  value={
                    editProduct.product_name
                  }
                  onChange={
                    handleEditChange
                  }
                  required
                />

              </div>



              {/* PRODUCT PRICE */}

              <div className="form-group">

                <label>
                  Product Price
                </label>

                <div className="price-input">

                  <IndianRupee size={17} />

                  <input
                    type="number"
                    name="product_price"
                    value={
                      editProduct.product_price
                    }
                    onChange={
                      handleEditChange
                    }
                    min="0"
                    step="0.01"
                    required
                  />

                </div>

              </div>



              {/* BUTTONS */}

              <div className="modal-actions">


                {/* CANCEL */}

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() =>
                    setShowEditModal(
                      false
                    )
                  }
                >

                  Cancel

                </button>



                {/* UPDATE */}

                <button
                  type="submit"
                  className="update-button"
                  disabled={
                    updateLoading
                  }
                >

                  {updateLoading ? (

                    <>

                      <RefreshCw
                        size={17}
                        className="spinning"
                      />

                      Updating...

                    </>

                  ) : (

                    <>

                      <Save size={17} />

                      Update Product

                    </>

                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );
}

export default Products;



