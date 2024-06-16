import { randomUUID } from "node:crypto";
import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body;

      if (!title && !description) {
        return res.writeHead(400).end();
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      database.insert("tasks", task);

      return res.writeHead(201).end();
    },
  },
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query;
      const tasks = database.select(
        "tasks",
        search
          ? {
              title: search,
              description: search,
            }
          : null,
      );

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      if (title && description) {
        return res.writeHead(400).end();
      } else if (!title && !description) {
        return res.writeHead(400).end();
      }

      let task = database.getOne("tasks", id);
      if (!task) {
        return res.writeHead(404).end("Task com id não encontrado");
      }

      if (title) {
        task.title = title;
      } else {
        task.description = description;
      }

      task.updated_at = new Date();

      database.update("tasks", id, task);

      return res.writeHead(204).end();
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;

      const task = database.getOne("tasks", id);

      if (!task) {
        return res.writeHead(404).end("Task com id não encontrado");
      }

      database.delete("tasks", id);
      return res.writeHead(204).end();
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params;

      let task = database.getOne("tasks", id);
      if (!task) {
        return res.writeHead(404).end("Task com id não encontrado");
      }

      task.completed_at = new Date();

      task.updated_at = new Date();

      database.update("tasks", id, task);

      return res.writeHead(204).end();
    },
  },
];
