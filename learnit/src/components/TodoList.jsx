import React, { useCallback, useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Lottie from "lottie-react";
import loadingLottie from "../assets/lotties/loading.json";

const TodoList = () => {
  const [popOverVis, setPopOverVis] = useState("Close Popup");
  const [tasks, setTasks] = useState([]);
  const [updatingTask, setUpdatingTask] = useState(false);

  const [formFields, setFormFields] = useState({
    title: "",
    desc: "",
    uid: uuidv4(),
    status: "Pending", // Set default status to "Pending"
  });

  // To store the ID of the task being edited
  const [editingTaskId, setEditingTaskId] = useState(null);

  // Load tasks from the database when the component mounts
  useEffect(() => {
    axios
      .get("/api/tasks")
      .then((response) => {
        setTasks(response.data);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
      });
  }, []);

  const handleFormFields = useCallback((key, val) => {
    const newValue = val.target.value;
    setFormFields((prev) => ({ ...prev, [key]: newValue }));
  }, []);

  const addTodoList = useCallback(() => {
    setUpdatingTask(true);
    if (formFields.title !== "" && formFields.desc !== "") {
      if (editingTaskId) {
        // Edit task
        axios
          .put(`/api/tasks/${editingTaskId}`, formFields)
          .then((response) => {
            setTasks((prevTasks) =>
              prevTasks.map((task) =>
                task._id === editingTaskId ? response.data : task
              )
            );
            setEditingTaskId(null);
            setFormFields({
              title: "",
              desc: "",
              uid: uuidv4(),
              status: "Pending",
            }); // Reset to default status
            setPopOverVis("Close Popup");
            setUpdatingTask(false);
          })
          .catch((error) => {
            console.error("Error updating task:", error);
          });
      } else {
        setUpdatingTask(true);
        // Add new task
        axios
          .post("/api/tasks", formFields)
          .then((response) => {
            setTasks((prevTasks) => [...prevTasks, response.data]);
            setFormFields({
              title: "",
              desc: "",
              uid: uuidv4(),
              status: "Pending",
            }); // Reset to default status
            setPopOverVis("Close Popup");
            setUpdatingTask(false);
          })
          .catch((error) => {
            console.error(
              "Error adding task:",
              error.response?.data || error.message
            );
          });
      }
    }
  }, [formFields, editingTaskId]);

  const editTodo = (id) => {
    const taskToEdit = tasks.find((task) => task._id === id);
    if (taskToEdit) {
      setFormFields({
        title: taskToEdit.title,
        desc: taskToEdit.desc,
        uid: taskToEdit._id,
        status: taskToEdit.status || "Pending", // Pre-select status, defaulting to "Pending"
      });
      setEditingTaskId(id);
      setPopOverVis("Open Popup");
    }
  };

  const deleteTodo = (id) => {
    axios
      .delete(`/api/tasks/${id}`)
      .then(() => {
        setTasks((prevTasks) => prevTasks.filter((task) => task._id !== id));
      })
      .catch((error) => {
        console.error("Error deleting task:", error);
      });
  };

  return (
    <div className="todoList">
      <header>
        <h2>Todo List</h2>
        <button onClick={() => setPopOverVis("Open Popup")}>
          Add Todo List
        </button>
      </header>

      <div className="todoListBody">
        {popOverVis === "Open Popup" && (
          <div className="popOverForm">
            <form action="#">
              <h2>{editingTaskId ? "Edit Todo List" : "Add Todo List"}</h2>
              <div className="fieldBox">
                <label htmlFor="titleField">Title</label>
                <input
                  id="titleField"
                  type="text"
                  value={formFields.title}
                  onChange={(value) => handleFormFields("title", value)}
                />
              </div>
              <div className="fieldBox">
                <label htmlFor="descField">What To Do?</label>
                <textarea
                  name="descField"
                  id="descField"
                  cols="30"
                  rows="10"
                  onChange={(value) => handleFormFields("desc", value)}
                  value={formFields.desc}
                ></textarea>
              </div>
              <div className="fieldBox">
                <label>Status</label>
                <div className="radioFields">
                  <div className="radio">
                    <input
                      type="radio"
                      name="statusField"
                      id="pendingStatus"
                      value="Pending"
                      onChange={(value) => handleFormFields("status", value)}
                      checked={formFields.status === "Pending"} // Set checked condition
                    />
                    <span className="mark"></span>
                    <label htmlFor="pendingStatus">Pending</label>
                  </div>
                  <div className="radio">
                    <input
                      type="radio"
                      name="statusField"
                      id="inProgressStatus"
                      value="In Progress"
                      onChange={(value) => handleFormFields("status", value)}
                      checked={formFields.status === "In Progress"} // Set checked condition
                    />
                    <span className="mark"></span>
                    <label htmlFor="inProgressStatus">In Progress</label>
                  </div>
                  <div className="radio">
                    <input
                      type="radio"
                      name="statusField"
                      id="completedStatus"
                      value="Completed"
                      onChange={(value) => handleFormFields("status", value)}
                      checked={formFields.status === "Completed"} // Set checked condition
                    />
                    <span className="mark"></span>
                    <label htmlFor="completedStatus">Completed</label>
                  </div>
                </div>
              </div>
              <div className="formButtons">
                <button
                  className="successButton"
                  onClick={addTodoList}
                  type="button"
                >
                  {editingTaskId ? "Update" : "Add"}
                </button>
                <button
                  className="dangerButton"
                  onClick={() => setPopOverVis("Close Popup")}
                >
                  Cancel
                </button>
                {updatingTask && (
                  <Lottie
                    animationData={loadingLottie}
                    loop={true}
                    style={{ height: "40px", width: "40px" }}
                  />
                )}
              </div>
            </form>
          </div>
        )}

        <table className="todoTable">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Edit/Delete</th>
              <th>Status</th>
            </tr>
          </thead>
          {tasks.length > 0 && (
            <tbody>
              {tasks.map((task, index) => (
                <tr key={task._id}>
                  <td>{index + 1}</td>
                  <td>{task.title}</td>
                  <td>{task.desc}</td>
                  <td>
                    <button
                      className="successButton"
                      onClick={() => editTodo(task._id)}
                    >
                      Edit
                    </button>{" "}
                    <button
                      className="dangerButton"
                      onClick={() => deleteTodo(task._id)}
                    >
                      Delete
                    </button>
                  </td>
                  <td>
                    <div className={"status status-"+task.status}>
                      <span></span>
                      <p>{task.status}</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>

        {tasks.length < 1 && <div className="emptyList"></div>}
      </div>
    </div>
  );
};

export default TodoList;
