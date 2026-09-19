import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";

const app = express();

const PORT = 5000;
const sqlite = sqlite3.verbose();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new sqlite.Database("./data/students.db", (err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("Connected to SQLite database");
    }
});

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "SQLite Backend is running"
    });
});

// Students
app.get("/students", (req, res) => {
    db.all("SELECT * FROM students", [], (err, rows) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(rows);
    });
});

// ====To update students==============
app.put("/students/:id", (req, res) => {
    const { id } = req.params;

    const { name, email, age, course } = req.body;

    const sql = `
        UPDATE students
        SET name = ?, email = ?, age = ?, course = ?
        WHERE id = ?
    `;

    db.run(
        sql,
        [name, email, age, course, id],
        function (err) {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    error: err.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Student not found"
                });
            }

            // Get updated student
            db.get(
                "SELECT * FROM students WHERE id = ?",
                [id],
                (err, student) => {

                    if (err) {
                        return res.status(500).json({
                            error: err.message
                        });
                    }

                    res.json({
                        message: "Student updated successfully",
                        student: student
                    });
                }
            );
        }
    );
});


// Products
// ===============================
// GET ALL PRODUCTS
// ===============================

app.get("/products", (req, res) => {
    const sql = "SELECT * FROM products";

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(rows);
    });
});


// ===============================
// SEARCH PRODUCT BY EXACT NAME
// ===============================

app.get("/products/search", (req, res) => {

    const { name } = req.query;

    if (!name) {
        return res.status(400).json({
            error: "Product name is required"
        });
    }

    const sql = `
        SELECT *
        FROM products
        WHERE product_name = ?
    `;

    db.get(sql, [name], (err, product) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (!product) {
            return res.status(404).json({
                error: "Product not found"
            });
        }

        res.json(product);
    });
});


// ===============================
// UPDATE PRODUCT
// ===============================

app.put("/products/:id", (req, res) => {

    const { id } = req.params;

    const {
        product_name,
        product_price
    } = req.body;

    if (!product_name || product_price === undefined) {
        return res.status(400).json({
            error: "Product name and price are required"
        });
    }

    const sql = `
        UPDATE products
        SET product_name = ?,
            product_price = ?
        WHERE product_id = ?
    `;

    db.run(
        sql,
        [product_name, Number(product_price), id],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Product not found"
                });
            }

            // Get updated product
            db.get(
                "SELECT * FROM products WHERE product_id = ?",
                [id],
                (err, product) => {

                    if (err) {
                        return res.status(500).json({
                            error: err.message
                        });
                    }

                    res.json({
                        message: "Product updated successfully",
                        product: product
                    });
                }
            );
        }
    );
});

// Balanceeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
// ===============================
// GET ALL BALANCE
// ===============================

app.get("/balance", (req, res) => {

    db.all(
        "SELECT * FROM balance",
        [],
        (err, rows) => {

            if (err) {
                console.error(
                    "Balance fetch error:",
                    err.message
                );

                return res.status(500).json({
                    error: err.message
                });
            }

            console.log(
                "Balance records:",
                rows.length
            );

            res.json(rows);
        }
    );
});


// ===============================
// BUY PRODUCT
// ===============================

app.post("/balance/buy/:balanceId", (req, res) => {

    const { quantity } = req.body;

    const balanceId = Number(req.params.balanceId);


    // ===============================
    // VALIDATION
    // ===============================

    if (
        !Number.isInteger(balanceId) ||
        balanceId <= 0
    ) {
        return res.status(400).json({
            error: "Invalid balance ID"
        });
    }


    if (
        quantity === undefined ||
        !Number.isInteger(Number(quantity)) ||
        Number(quantity) <= 0
    ) {
        return res.status(400).json({
            error: "Quantity must be a positive integer"
        });
    }


    const buyQuantity = Number(quantity);


    // ===============================
    // START TRANSACTION
    // ===============================

    db.run(
        "BEGIN IMMEDIATE TRANSACTION",
        (err) => {

            if (err) {

                console.error(
                    "Transaction start error:",
                    err.message
                );

                return res.status(500).json({
                    error: "Could not start transaction"
                });
            }


            // ===============================
            // GET BALANCE RECORD
            // ===============================

            db.get(
                `
                SELECT *
                FROM balance
                WHERE balance_id = ?
                `,
                [balanceId],
                (err, balance) => {

                    if (err) {

                        return rollback(
                            res,
                            err.message
                        );
                    }


                    // ===============================
                    // BALANCE NOT FOUND
                    // ===============================

                    if (!balance) {

                        return rollback(
                            res,
                            "Balance record not found",
                            404
                        );
                    }


                    // ===============================
                    // CHECK QUANTITY
                    // ===============================

                    if (
                        buyQuantity >
                        Number(balance.quantity)
                    ) {

                        return rollback(
                            res,
                            `Insufficient quantity. Available: ${balance.quantity}`,
                            400
                        );
                    }


                    // ===============================
                    // DEDUCT QUANTITY
                    // ===============================

                    db.run(
                        `
                        UPDATE balance
                        SET quantity = quantity - ?
                        WHERE balance_id = ?
                        AND quantity >= ?
                        `,
                        [
                            buyQuantity,
                            balanceId,
                            buyQuantity
                        ],
                        function (err) {

                            if (err) {

                                return rollback(
                                    res,
                                    err.message
                                );
                            }


                            // ===============================
                            // UPDATE FAILED
                            // ===============================

                            if (this.changes === 0) {

                                return rollback(
                                    res,
                                    "Insufficient quantity",
                                    400
                                );
                            }


                            // ===============================
                            // GET REMAINING QUANTITY
                            // ===============================

                            db.get(
                                `
                                SELECT quantity
                                FROM balance
                                WHERE balance_id = ?
                                `,
                                [balanceId],
                                (err, updatedBalance) => {

                                    if (err) {

                                        return rollback(
                                            res,
                                            err.message
                                        );
                                    }


                                    // ===============================
                                    // QUANTITY = 0
                                    // DELETE RECORD
                                    // ===============================

                                    if (
                                        Number(
                                            updatedBalance.quantity
                                        ) === 0
                                    ) {

                                        db.run(
                                            `
                                            DELETE FROM balance
                                            WHERE balance_id = ?
                                            `,
                                            [balanceId],
                                            function (err) {

                                                if (err) {

                                                    return rollback(
                                                        res,
                                                        err.message
                                                    );
                                                }


                                                // ===============================
                                                // COMMIT
                                                // ===============================

                                                db.run(
                                                    "COMMIT",
                                                    (err) => {

                                                        if (err) {

                                                            return res.status(500).json({
                                                                error:
                                                                    err.message
                                                            });
                                                        }


                                                        res.json({
                                                            success: true,

                                                            message:
                                                                "Purchase successful. Balance is now 0 and the record was deleted.",

                                                            balance_id:
                                                                balanceId,

                                                            purchased_quantity:
                                                                buyQuantity,

                                                            remaining_quantity:
                                                                0,

                                                            sold_out:
                                                                true
                                                        });

                                                    }
                                                );

                                            }
                                        );

                                    }


                                    // ===============================
                                    // QUANTITY STILL EXISTS
                                    // ===============================

                                    else {

                                        db.run(
                                            "COMMIT",
                                            (err) => {

                                                if (err) {

                                                    return res.status(500).json({
                                                        error:
                                                            err.message
                                                    });
                                                }


                                                res.json({
                                                    success: true,

                                                    message:
                                                        "Purchase successful",

                                                    balance_id:
                                                        balanceId,

                                                    purchased_quantity:
                                                        buyQuantity,

                                                    remaining_quantity:
                                                        Number(
                                                            updatedBalance.quantity
                                                        ),

                                                    sold_out:
                                                        false
                                                });

                                            }
                                        );

                                    }

                                }
                            );

                        }
                    );

                }
            );

        }
    );

});


// ===============================
// ROLLBACK FUNCTION
// ===============================

function rollback(
    res,
    message,
    statusCode = 500
) {

    db.run(
        "ROLLBACK",
        () => {

            res.status(statusCode).json({
                error: message
            });

        }
    );
}


app.get("/students/search", (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({
            error: "Email is required"
        });
    }

    const sql = `
        SELECT *
        FROM students
        WHERE email = ?
    `;

    db.get(sql, [email], (err, student) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (!student) {
            return res.status(404).json({
                error: "Student not found"
            });
        }

        res.json(student);
    });
});
// Orders
app.get("/orders", (req, res) => {
    db.all("SELECT * FROM orders LIMIT 1000", [], (err, rows) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(rows);
    });
});


app.delete("/students/:id", (req, res) => {

    const { id } = req.params;

    db.run(
        "DELETE FROM students WHERE id = ?",
        [id],
        function (err) {

            if (err) {
                console.error(
                    "Delete student error:",
                    err.message
                );

                return res.status(500).json({
                    error: err.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Student not found"
                });
            }

            console.log(
                `Student ${id} deleted successfully`
            );

            res.json({
                success: true,
                message: "Student deleted successfully",
                deleted_id: id
            });
        }
    );
});
app.get("/orders/search", (req, res) => {

    const { order_id } = req.query;

    if (!order_id) {
        return res.status(400).json({
            error: "Order ID is required"
        });
    }

    const sql = `
        SELECT *
        FROM orders
        WHERE order_id = ?
    `;

    db.get(sql, [order_id], (err, order) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (!order) {
            return res.status(404).json({
                error: "Order not found"
            });
        }

        res.json(order);
    });

});

app.put("/orders/:id", (req, res) => {

    const { id } = req.params;

    const {
        user_id,
        product_id,
        quantity,
        order_date
    } = req.body;

    if (
        user_id === undefined ||
        product_id === undefined ||
        quantity === undefined ||
        !order_date
    ) {
        return res.status(400).json({
            error: "All order fields are required"
        });
    }

    const sql = `
        UPDATE orders
        SET
            user_id = ?,
            product_id = ?,
            quantity = ?,
            order_date = ?
        WHERE order_id = ?
    `;

    db.run(
        sql,
        [
            Number(user_id),
            Number(product_id),
            Number(quantity),
            order_date,
            id
        ],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Order not found"
                });
            }

            db.get(
                "SELECT * FROM orders WHERE order_id = ?",
                [id],
                (err, order) => {

                    if (err) {
                        return res.status(500).json({
                            error: err.message
                        });
                    }

                    res.json({
                        message: "Order updated successfully",
                        order: order
                    });

                }
            );

        }
    );

});


app.delete("/orders/:id", (req, res) => {

    const { id } = req.params;

    const sql = `
        DELETE FROM orders
        WHERE order_id = ?
    `;

    db.run(sql, [id], function (err) {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                error: "Order not found"
            });
        }

        res.json({
            message: "Order deleted successfully",
            order_id: id
        });

    });

});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});