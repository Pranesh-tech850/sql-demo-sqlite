import { useState } from "react";
import {
  GraduationCap,
  Search,
  RefreshCw,
  Edit3,
  Trash2,
  ArrowLeft,
  X,
  Save,
  Mail,
} from "lucide-react";
import { Link } from "react-router-dom";

function Students() {

  // =========================================
  // STUDENTS
  // =========================================

  const [students, setStudents] = useState([]);

  // Search email
  const [search, setSearch] = useState("");

  // Loading
  const [loading, setLoading] = useState(false);

  // Error
  const [error, setError] = useState("");


  // =========================================
  // EDIT MODAL
  // =========================================

  const [showEditModal, setShowEditModal] = useState(false);

  const [editStudent, setEditStudent] = useState({
    id: "",
    name: "",
    email: "",
    age: "",
    course: "",
  });

  const [updateLoading, setUpdateLoading] = useState(false);


  // =========================================
  // FETCH ALL STUDENTS
  // =========================================

  const fetchStudents = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/students"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }

      const data = await response.json();

      setStudents(data);

    } catch (err) {

      console.error(err);

      setError(err.message);

      setStudents([]);

    } finally {

      setLoading(false);

    }
  };


  // =========================================
  // SEARCH STUDENT BY FULL EMAIL
  // =========================================

  const searchStudent = async () => {

    // Remove spaces
    const email = search.trim();

    if (!email) {

      setError("Please enter an email address");

      return;
    }

    try {

      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/students/search?email=${encodeURIComponent(
          email
        )}`
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.error || "Student not found"
        );
      }

      // Backend returns ONE student
      setStudents([data]);

    } catch (err) {

      console.error(err);

      setStudents([]);

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

    setStudents([]);

    setError("");

  };


  // =========================================
  // OPEN EDIT MODAL
  // =========================================

  const handleEdit = (student) => {

    setEditStudent({
      id: student.id,
      name: student.name,
      email: student.email,
      age: student.age,
      course: student.course,
    });

    setShowEditModal(true);

  };


  // =========================================
  // EDIT INPUT CHANGE
  // =========================================

  const handleEditChange = (e) => {

    const { name, value } = e.target;

    setEditStudent((prev) => ({
      ...prev,
      [name]: value,
    }));

  };


  // =========================================
  // UPDATE STUDENT
  // =========================================

  const handleUpdate = async (e) => {

    e.preventDefault();

    try {

      setUpdateLoading(true);

      setError("");

      const response = await fetch(
        `http://localhost:5000/students/${editStudent.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: editStudent.name,
            email: editStudent.email,
            age: Number(editStudent.age),
            course: editStudent.course,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.error || "Failed to update student"
        );
      }


      // =========================================
      // UPDATE REACT STATE
      // =========================================

      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student.id === editStudent.id
            ? data.student
            : student
        )
      );


      // Close modal
      setShowEditModal(false);


      // Clear error
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

 const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
        `Are you sure you want to delete student #${id}?`
    );

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:5000/students/${id}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Failed to delete student"
            );
        }

        alert("Student deleted successfully!");

        // Refresh students table
        fetchStudents();

    } catch (error) {
        console.error(
            "Delete student error:",
            error
        );

        alert(error.message);
    }
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


          <div className="title-icon">

            <GraduationCap size={27} />

          </div>


          <div>

            <p className="page-label">
              DATABASE TABLE
            </p>

            <h1>
              Students
            </h1>

          </div>

        </div>


        <div className="record-count">

          {students.length} Records

        </div>

      </header>



      {/* =====================================
          CONTROLS
      ===================================== */}

      <section className="students-controls">


        {/* FETCH ALL */}

        <button
          className="fetch-button"
          onClick={fetchStudents}
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
            : "Fetch Students"}

        </button>



        {/* SEARCH AREA */}

        <div className="search-area">


          {/* SEARCH INPUT */}

          <div className="search-box">

            <Mail size={18} />


            <input
              type="email"
              placeholder="Enter full email..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              onKeyDown={(e) => {

                if (e.key === "Enter") {
                  searchStudent();
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
            onClick={searchStudent}
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
              Loading students...
            </p>

          </div>


        ) : students.length === 0 ? (


          /* =================================
             EMPTY
          ================================= */

          <div className="table-message">

            <GraduationCap size={45} />

            <h3>
              No students loaded
            </h3>

            <p>
              Click "Fetch Students" to load
              students from SQLite.
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
                    ID
                  </th>

                  <th>
                    Name
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Age
                  </th>

                  <th>
                    Course
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {students.map((student) => (

                  <tr
                    key={student.id}
                  >


                    {/* ID */}

                    <td>

                      <span className="id-badge">

                        #{student.id}

                      </span>

                    </td>


                    {/* NAME */}

                    <td className="student-name">

                      {student.name}

                    </td>


                    {/* EMAIL */}

                    <td className="student-email">

                      {student.email}

                    </td>


                    {/* AGE */}

                    <td>

                      {student.age}

                    </td>


                    {/* COURSE */}

                    <td>

                      <span className="course-badge">

                        {student.course}

                      </span>

                    </td>


                    {/* ACTIONS */}

                    <td>

                      <div className="action-buttons">


                        {/* EDIT */}

                        <button
                          className="edit-button"
                          title="Edit student"
                          onClick={() =>
                            handleEdit(student)
                          }
                        >

                          <Edit3 size={16} />

                        </button>


                        {/* DELETE */}

                        <button
                          className="delete-button"
                          title="Delete student"
                          onClick={() =>
                            handleDelete(
                              student.id
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
                  STUDENT RECORD
                </p>

                <h2>
                  Edit Student
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


              {/* NAME */}

              <div className="form-group">

                <label>
                  Student Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    editStudent.name
                  }
                  onChange={
                    handleEditChange
                  }
                  required
                />

              </div>



              {/* EMAIL */}

              <div className="form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={
                    editStudent.email
                  }
                  onChange={
                    handleEditChange
                  }
                  required
                />

              </div>



              {/* AGE */}

              <div className="form-group">

                <label>
                  Age
                </label>

                <input
                  type="number"
                  name="age"
                  value={
                    editStudent.age
                  }
                  onChange={
                    handleEditChange
                  }
                  min="1"
                  max="100"
                  required
                />

              </div>



              {/* COURSE */}

              <div className="form-group">

                <label>
                  Course
                </label>

                <input
                  type="text"
                  name="course"
                  value={
                    editStudent.course
                  }
                  onChange={
                    handleEditChange
                  }
                  required
                />

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

                      Update Student

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

export default Students;