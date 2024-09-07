import React, { useCallback, useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { FcInfo } from "react-icons/fc";

const TodoList = () => {
  const [popOverVis, setPopOverVis] = useState("Close Popup");
  const [tasks, setTasks] = useState([]);

  const [formFields, setFormFields] = useState({
    title: "",
    desc: "",
    uid: uuidv4(), // We can drop this once the database handles unique IDs
  });

  // To store the ID of the task being edited
  const [editingTaskId, setEditingTaskId] = useState(null);

  // Load tasks from the database when the component mounts
  useEffect(() => {
    axios
      .get("/api/tasks") // Adjust the API endpoint based on your backend
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
    if (formFields.title !== "" && formFields.desc !== "") {
      if (editingTaskId) {
        // Edit task
        axios
          .put(`/api/tasks/${editingTaskId}`, formFields) // Adjust API endpoint
          .then((response) => {
            setTasks((prevTasks) =>
              prevTasks.map((task) =>
                task._id === editingTaskId ? response.data : task
              )
            );
            setEditingTaskId(null); // Reset after editing
            setFormFields({ title: "", desc: "", uid: uuidv4() });
            setPopOverVis("Close Popup");
          })
          .catch((error) => {
            console.error("Error updating task:", error);
          });
      } else {
        // Add new task
        axios
          .post("/api/tasks", formFields) // Adjust the API endpoint
          .then((response) => {
            setTasks((prevTasks) => [...prevTasks, response.data]);
            setFormFields({ title: "", desc: "", uid: uuidv4() });
            setPopOverVis("Close Popup");
          })
          .catch((error) => {
            console.error("Error adding task:", error.response?.data || error.message);
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
      });
      setEditingTaskId(id); // Set the ID of the task being edited
      setPopOverVis("Open Popup"); // Open the form for editing
    }
  };

  const deleteTodo = (id) => {
    axios
      .delete(`/api/tasks/${id}`) // Adjust the API endpoint
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
            </tr>
          </thead>
          {tasks.length > 0 && <tbody>
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
              </tr>
            ))}
          </tbody> }
        </table>

        {tasks.length < 1 && <div className="emptyList"></div>}
      </div>
    </div>
  );
};

export default TodoList;
