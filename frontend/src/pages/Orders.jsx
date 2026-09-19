import { useState } from "react";
import {
  ShoppingCart,
  Search,
  RefreshCw,
  Edit3,
  Trash2,
  ArrowLeft,
  X,
  Save,
  Mail,
  User,
  Package,
  CalendarDays,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./Orders.css";

function Orders() {

  // ==========================================
  // API URL
  // ==========================================

  const API_URL = import.meta.env.VITE_API_URL;


  const [orders, setOrders] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [totalOrders, setTotalOrders] = useState(0);


  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);

  const [editOrder, setEditOrder] = useState({
    order_id: "",
    user_id: "",
    product_id: "",
    quantity: "",
    order_date: "",
  });

  const [updateLoading, setUpdateLoading] = useState(false);


  // ==========================================
  // FETCH ORDERS
  // ==========================================

  const fetchOrders = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/orders`
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.error || "Failed to fetch orders"
        );

      }

      console.log("Orders received:", data);

      setOrders(data);

      setTotalOrders(data.length);
      setPage(1);

    } catch (err) {

      console.error(
        "Fetch orders error:",
        err
      );

      setError(err.message);
      setOrders([]);

    } finally {

      setLoading(false);

    }
  };


  // ==========================================
  // SEARCH ORDER BY EMAIL
  // ==========================================

 const searchOrder = async () => {
    const email = search.trim();

    if (!email) {
        setError("Please enter an email");
        return;
    }

    try {
        setLoading(true);
        setError("");

        const response = await fetch(
            `${API_URL}/orders/search?email=${encodeURIComponent(email)}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "No orders found for this email"
            );
        }

        setOrders(data);
        setTotalOrders(data.length);
        setPage(1);

    } catch (err) {
        console.error(err);
        setOrders([]);
        setTotalOrders(0);
        setError(err.message);

    } finally {
        setLoading(false);
    }
};

  // ==========================================
  // CLEAR SEARCH
  // ==========================================

  const clearSearch = () => {

    setSearch("");

    setOrders([]);

    setError("");

    setPage(1);

    setTotalOrders(0);

  };


  // ==========================================
  // EDIT
  // ==========================================

  const handleEdit = (order) => {

    setEditOrder({

      order_id: order.order_id,

      user_id: order.user_id,

      product_id: order.product_id,

      quantity: order.quantity,

      order_date: order.order_date,

    });

    setShowEditModal(true);

  };


  // ==========================================
  // EDIT INPUT CHANGE
  // ==========================================

  const handleEditChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setEditOrder((prev) => ({

      ...prev,

      [name]: value,

    }));

  };


  // ==========================================
  // UPDATE ORDER
  // ==========================================

  const handleUpdate = async (e) => {

    e.preventDefault();

    try {

      setUpdateLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/orders/${editOrder.order_id}`,
        {

          method: "PUT",

          headers: {

            "Content-Type": "application/json",

          },

          body: JSON.stringify({

            user_id: Number(
              editOrder.user_id
            ),

            product_id: Number(
              editOrder.product_id
            ),

            quantity: Number(
              editOrder.quantity
            ),

            order_date:
              editOrder.order_date,

          }),

        }
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.error ||
          "Failed to update order"
        );

      }


      // Update only the edited row

      setOrders((prevOrders) =>

        prevOrders.map((order) =>

          order.order_id ===
          editOrder.order_id

            ? data.order

            : order

        )

      );

      setShowEditModal(false);

    } catch (err) {

      console.error(err);

      setError(err.message);

    } finally {

      setUpdateLoading(false);

    }
  };


  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (id) => {

    const confirmDelete =
      window.confirm(
        `Are you sure you want to delete order #${id}?`
      );

    if (!confirmDelete) {

      return;

    }

    try {

      const response = await fetch(
        `${API_URL}/orders/${id}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.error ||
          "Failed to delete order"
        );

      }

      alert(data.message);


      // Remove deleted order
      // from current React state

      setOrders((prevOrders) =>

        prevOrders.filter(
          (order) =>
            order.order_id !== id
        )

      );

      setTotalOrders((prev) =>
        Math.max(prev - 1, 0)
      );

    } catch (err) {

      console.error(
        "Delete error:",
        err
      );

      alert(err.message);

    }

  };


  // ==========================================
  // PAGINATION
  // ==========================================

  const totalPages =
    Math.ceil(
      totalOrders / limit
    );


  const handlePrevious = () => {

    if (page > 1) {

      fetchOrders(page - 1);

    }

  };


  const handleNext = () => {

    if (page < totalPages) {

      fetchOrders(page + 1);

    }

  };


  return (

    <div className="students-page">


      {/* ==========================================
          HEADER
      ========================================== */}

      <header className="students-header">

        <div className="students-title">

          <Link
            to="/"
            className="back-button"
          >

            <ArrowLeft size={19} />

          </Link>


          <div className="title-icon">

            <ShoppingCart size={27} />

          </div>


          <div>

            <p className="page-label">

              DATABASE TABLE

            </p>

            <h1>

              Orders

            </h1>

          </div>

        </div>


        <div className="record-count">

          {totalOrders.toLocaleString()}
          {" "}Records

        </div>

      </header>


      {/* ==========================================
          CONTROLS
      ========================================== */}

      <section className="students-controls">


        <button
          className="fetch-button"
          onClick={fetchOrders}
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
            : "Fetch Orders"}

        </button>


        <div className="search-area">


          <div className="search-box">

            <Mail size={18} />


            <input
              type="email"
              placeholder="Enter email..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              onKeyDown={(e) => {

                if (e.key === "Enter") {

                  searchOrder();

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


          <button
            className="search-button"
            onClick={searchOrder}
            disabled={loading}
          >

            <Search size={17} />

            {loading
              ? "Searching..."
              : "Search"}

          </button>

        </div>

      </section>


      {/* ==========================================
          ERROR
      ========================================== */}

      {error && (

        <div className="error-message">

          {error}

        </div>

      )}


      {/* ==========================================
          TABLE
      ========================================== */}

      <section className="students-table-container">


        {loading ? (

          <div className="table-message">

            <RefreshCw
              className="spinning"
              size={30}
            />

            <p>

              Loading orders...

            </p>

          </div>

        ) : orders.length === 0 ? (

          <div className="table-message">

            <ShoppingCart size={45} />

            <h3>

              No orders loaded

            </h3>

            <p>

              Click "Fetch Orders" to load
              orders from SQLite.

            </p>

          </div>

        ) : (

          <div className="table-scroll">

            <table>

              <thead>

                <tr>

                  <th>
                    Order ID
                  </th>

                  <th>
                    User ID
                  </th>

                  <th>
                    Product ID
                  </th>

                  <th>
                    Quantity
                  </th>

                  <th>
                    E-mail
                  </th>

                  <th>
                    Order Date
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {orders.map(
                  (order) => (

                  <tr
                    key={
                      order.order_id
                    }
                  >


                    <td>

                      <span className="id-badge">

                        #
                        {order.order_id}

                      </span>

                    </td>


                    <td>

                      <span className="order-user-badge">

                        <User size={14} />

                        {order.user_id}

                      </span>

                    </td>


                    <td>

                      <span className="order-product-badge">

                        <Package size={14} />

                        {order.product_id}

                      </span>

                    </td>


                    <td className="order-quantity">

                      {order.quantity}

                    </td>


                    <td className="order-quantity">

                      {order.email}

                    </td>


                    <td className="order-date">

                      <CalendarDays size={15} />

                      {order.order_date}

                    </td>


                    <td>

                      <div className="action-buttons">


                        <button
                          className="edit-button"
                          title="Edit order"
                          onClick={() =>
                            handleEdit(
                              order
                            )
                          }
                        >

                          <Edit3 size={16} />

                        </button>


                        <button
                          className="delete-button"
                          title="Delete order"
                          onClick={() =>
                            handleDelete(
                              order.order_id
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


      {/* ==========================================
          PAGINATION
      ========================================== */}

      {orders.length > 0 &&
        totalPages > 1 && (

        <div className="orders-pagination">

          <button
            className="pagination-button"
            onClick={handlePrevious}
            disabled={
              page === 1 ||
              loading
            }
          >

            ← Previous

          </button>


          <div className="pagination-info">

            Page{" "}
            <strong>
              {page}
            </strong>
            {" "}of{" "}

            <strong>
              {totalPages}
            </strong>

          </div>


          <button
            className="pagination-button"
            onClick={handleNext}
            disabled={
              page === totalPages ||
              loading
            }
          >

            Next →

          </button>

        </div>

      )}


      {/* ==========================================
          EDIT MODAL
      ========================================== */}

      {showEditModal && (

        <div className="modal-overlay">

          <div className="edit-modal">


            <div className="modal-header">

              <div>

                <p className="modal-label">

                  ORDER RECORD

                </p>

                <h2>

                  Edit Order

                </h2>

              </div>


              <button
                className="close-modal"
                onClick={() =>
                  setShowEditModal(
                    false
                  )
                }
                type="button"
              >

                <X size={20} />

              </button>

            </div>


            <form
              onSubmit={handleUpdate}
            >


              {/* USER ID */}

              <div className="form-group">

                <label>

                  User ID

                </label>

                <input
                  type="number"
                  name="user_id"
                  value={
                    editOrder.user_id
                  }
                  onChange={
                    handleEditChange
                  }
                  required
                  min="1"
                />

              </div>


              {/* PRODUCT ID */}

              <div className="form-group">

                <label>

                  Product ID

                </label>

                <input
                  type="number"
                  name="product_id"
                  value={
                    editOrder.product_id
                  }
                  onChange={
                    handleEditChange
                  }
                  required
                  min="1"
                />

              </div>


              {/* QUANTITY */}

              <div className="form-group">

                <label>

                  Quantity

                </label>

                <input
                  type="number"
                  name="quantity"
                  value={
                    editOrder.quantity
                  }
                  onChange={
                    handleEditChange
                  }
                  required
                  min="1"
                />

              </div>


              {/* ORDER DATE */}

              <div className="form-group">

                <label>

                  Order Date

                </label>

                <input
                  type="text"
                  name="order_date"
                  value={
                    editOrder.order_date
                  }
                  onChange={
                    handleEditChange
                  }
                  required
                />

              </div>


              {/* ACTIONS */}

              <div className="modal-actions">

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

                      Update Order

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

export default Orders;